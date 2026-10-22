#!/usr/bin/env node
/**
 * Low-memory development server.
 *
 * `npm run dev` keeps Vite's dev server resident: the module graph, the
 * transform cache and the dependency optimizer all live for the whole session.
 * Vite's own V8 heap is already around 100 MB before a page is loaded, so that
 * process cannot be brought under a 100 MB ceiling while keeping HMR.
 *
 * This mode trades HMR for a small resident set. It builds `dist-dev/` with the
 * ordinary Vite build pipeline (same config, same post compiler, same CSS),
 * serves it from a plain Node HTTP server, and runs a rebuild in a short-lived
 * child process when a source file changes. Only the Node server and its file
 * watchers stay in memory; the expensive Vite/Rollup process exits after each
 * rebuild.
 *
 * Trade-offs:
 *   - a change triggers a full page reload instead of React Fast Refresh;
 *   - a rebuild takes roughly the same time as `vite build` (~1-2 s here);
 *   - the short-lived build child still uses the memory `vite build` needs.
 *
 * The site's runtime logic is untouched.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITE_BIN = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const EVENTS_PATH = '/__lowmem_events';

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback) => {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;
  const next = argv[index + 1];
  return next && !next.startsWith('--') ? next : fallback;
};

const port = Number(value('--port', process.env.PORT ?? 5173));
const mode = value('--mode', 'development');
const outputDir = path.resolve(ROOT, value('--dir', 'dist-dev'));
const shouldBuild = !has('--no-build');
const shouldWatch = !has('--no-watch');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`[lowmem] invalid port: ${port}`);
  process.exit(1);
}

/* ------------------------------------------------------------- rebuilding -- */

let buildPromise = null;
let buildQueued = false;
let buildChild = null;
let lastError = '';
let rebuildTimer = null;

/**
 * Run the real Vite build in a child process.
 *
 * The child exits when the build finishes, taking Rollup's memory with it. A
 * change that lands while a build is running queues exactly one follow-up
 * build, so a burst of saves cannot pile up processes.
 */
const build = () => {
  if (buildPromise) {
    buildQueued = true;
    return buildPromise;
  }

  const startedAt = Date.now();
  buildPromise = new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        VITE_BIN,
        'build',
        '--mode',
        mode,
        '--minify',
        'false',
        '--outDir',
        path.relative(ROOT, outputDir),
        '--emptyOutDir',
      ],
      {
        cwd: ROOT,
        // A caller may have capped the server's heap; the build needs its own
        // budget and must not inherit that ceiling.
        env: { ...process.env, NODE_OPTIONS: '' },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    buildChild = child;
    let output = '';
    let settled = false;

    child.stdout.on('data', (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
      process.stderr.write(chunk);
    });

    const finish = (code, error) => {
      if (settled) return;
      settled = true;
      buildChild = null;
      buildPromise = null;

      if (code === 0) {
        lastError = '';
        console.log(`[lowmem] built in ${Date.now() - startedAt} ms`);
        broadcast('reload');
      } else {
        lastError = error ?? output.trim().split('\n').slice(-40).join('\n');
        console.error(`[lowmem] build failed${code === null ? '' : ` (exit ${code})`}`);
        broadcast('build-error', lastError);
      }

      if (buildQueued) {
        buildQueued = false;
        void build();
      }
      resolve();
    };

    child.on('error', (error) => finish(null, error.message));
    child.on('close', (code) => finish(code));
  });

  return buildPromise;
};

const scheduleBuild = () => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => void build(), 160);
};

/* ------------------------------------------------------------ live reload -- */

const clients = new Set();

const broadcast = (event, data = '') => {
  if (clients.size === 0) return;
  const lines = String(data)
    .split('\n')
    .map((line) => `data: ${line}`)
    .join('\n');
  const payload = `event: ${event}\n${lines}\n\n`;
  for (const client of clients) client.write(payload);
};

/**
 * The client is injected into HTML as it is served, so `dist-dev/index.html`
 * stays identical to what a build produces.
 */
const LIVE_RELOAD_CLIENT = `<script>(() => {
  const events = new EventSource(${JSON.stringify(EVENTS_PATH)});
  events.addEventListener('reload', () => location.reload());
  events.addEventListener('build-error', (event) => {
    let panel = document.getElementById('__lowmem_error');
    if (!panel) {
      panel = document.createElement('pre');
      panel.id = '__lowmem_error';
      panel.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:2147483647', 'margin:0',
        'padding:24px', 'overflow:auto', 'background:#140b0b',
        'color:#ffb4b4', 'font:13px/1.5 ui-monospace,monospace',
        'white-space:pre-wrap'
      ].join(';');
      document.body.appendChild(panel);
    }
    panel.textContent = 'build failed\\n\\n' + event.data;
  });
})();</script>`;

/* --------------------------------------------------------------- serving -- */

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

const send = (res, status, headers, body) => {
  res.writeHead(status, headers);
  res.end(body);
};

const sendFile = (filePath, req, res, status) => {
  const type = MIME.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';

  if (type.startsWith('text/html')) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (shouldWatch) {
      html = html.includes('</body>')
        ? html.replace('</body>', `${LIVE_RELOAD_CLIENT}</body>`)
        : html + LIVE_RELOAD_CLIENT;
    }
    send(
      res,
      status,
      {
        'Content-Type': type,
        'Content-Length': Buffer.byteLength(html),
        'Cache-Control': 'no-store',
      },
      req.method === 'HEAD' ? undefined : html,
    );
    return;
  }

  const stat = fs.statSync(filePath);
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-store',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
};

const serve = (requestUrl, req, res) => {
  if (requestUrl.pathname === EVENTS_PATH) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);

    const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);
    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(res);
    });
    return;
  }

  let requestPath;
  try {
    requestPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad request');
    return;
  }

  if (requestPath.endsWith('/')) requestPath += 'index.html';

  const filePath = path.resolve(outputDir, `.${requestPath}`);
  if (filePath !== outputDir && !filePath.startsWith(outputDir + path.sep)) {
    send(res, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Forbidden');
    return;
  }

  let stat = null;
  try {
    stat = fs.statSync(filePath);
  } catch {
    stat = null;
  }

  if (stat?.isFile()) {
    sendFile(filePath, req, res, 200);
    return;
  }

  // GitHub Pages serves 404.html for unknown paths; the site's fragment router
  // boots from that shell. Match it here so reloads behave the same way.
  const fallback = path.join(outputDir, '404.html');
  if (fs.existsSync(fallback)) {
    sendFile(fallback, req, res, 404);
    return;
  }

  const index = path.join(outputDir, 'index.html');
  if (fs.existsSync(index)) {
    sendFile(index, req, res, 200);
    return;
  }

  send(
    res,
    503,
    { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    lastError || 'No build output yet. Run `npm run build` first.',
  );
};

/* --------------------------------------------------------------- watchers -- */

const IGNORED = new Set(['node_modules', '.git', 'dist', 'dist-dev', 'go-blog']);
const watchers = [];

const watchPath = (absolutePath) => {
  let stat;
  try {
    stat = fs.statSync(absolutePath);
  } catch {
    return;
  }

  if (!stat.isDirectory()) {
    watchers.push(fs.watch(absolutePath, scheduleBuild));
    return;
  }

  try {
    watchers.push(
      fs.watch(absolutePath, { recursive: true }, (_event, filename) => {
        if (filename) {
          const topLevel = String(filename).split(path.sep)[0];
          if (IGNORED.has(topLevel)) return;
        }
        scheduleBuild();
      }),
    );
  } catch {
    // Older platforms do not support recursive watching. Watch this directory
    // and walk its children instead; new subdirectories are covered by the
    // parent's own event.
    watchers.push(fs.watch(absolutePath, scheduleBuild));
    for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
      if (entry.isDirectory() && !IGNORED.has(entry.name)) {
        watchPath(path.join(absolutePath, entry.name));
      }
    }
  }
};

const startWatching = () => {
  for (const target of [
    'src',
    'build',
    'public',
    'index.html',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
  ]) {
    watchPath(path.join(ROOT, target));
  }
  console.log('[lowmem] watching src/, build/, public/ and the config files');
};

/* ----------------------------------------------------------------- server -- */

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  serve(requestUrl, req, res);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[lowmem] port ${port} is already in use; pass --port <n>`);
  } else {
    console.error(`[lowmem] server error: ${error.message}`);
  }
  process.exit(1);
});

const shutdown = () => {
  clearTimeout(rebuildTimer);
  for (const watcher of watchers) watcher.close();
  for (const client of clients) client.end();
  buildChild?.kill('SIGTERM');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(port, () => {
  const rss = Math.round(process.memoryUsage().rss / 1024 / 1024);
  const relativeOutput = path.relative(ROOT, outputDir) || '.';
  console.log(`[lowmem] serving ${relativeOutput} at http://localhost:${port} (server rss ~${rss} MB)`);
  if (shouldWatch) startWatching();
  if (shouldBuild) void build();
});
