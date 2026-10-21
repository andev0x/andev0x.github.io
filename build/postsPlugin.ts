import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import type { ModuleNode, Plugin, ViteDevServer } from 'vite'

// `front-matter` is CommonJS; load it through `createRequire` so this plugin
// works whether Vite compiles the config as ESM or CJS.
const require = createRequire(import.meta.url)
const fm = require('front-matter') as (raw: string) => {
  attributes: Record<string, unknown>
  body: string
}

const MANIFEST_ID = 'virtual:posts-manifest'
const RESOLVED_MANIFEST_ID = `\0${MANIFEST_ID}`
const POST_ID_PREFIX = 'virtual:post/'
const POSTS_DIR = 'src/data/posts'

export interface PostMeta {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  categories: string[]
  readingTime: number
  featured: boolean
}

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

const asNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** Rough reading time (200 wpm) used only when front matter omits it. */
const estimateReadingTime = (body: string): number =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200))

type ParsedPost = PostMeta & { file: string; body: string }

/**
 * Compiles `src/data/posts/*.md` into two virtual modules:
 *
 * - `virtual:posts-manifest` -> front-matter only (titles, tags, excerpts...)
 *   so the post list, search index and category bar cost a few kilobytes.
 * - `virtual:posts-manifest#loaders` -> one lazy `import()` per post body, so
 *   markdown is fetched only when a reader actually opens that post.
 *
 * Parsing happens at build time, which removes `front-matter` and every post
 * body from the runtime bundle.
 */
export function postsPlugin(): Plugin {
  let root = process.cwd()

  // Parsed posts, immutable for as long as the sources do not change.
  //
  // Every virtual module asks for the whole set, so without this cache one
  // post body costs a full directory read, a full front-matter parse and a
  // full word count — and the twenty-first module pays for it again. The
  // cache is dropped whenever a file in the posts directory changes.
  let cached: ParsedPost[] | null = null
  let cachedRoot: string | null = null

  // Whether the manifest has been served yet. The dev watcher replays an
  // `add` event for every file that already exists when it starts, and those
  // must not be mistaken for the author adding a post.
  let hasServed = false

  const postsDir = (): string => path.resolve(root, POSTS_DIR)

  const invalidate = (): void => {
    cached = null
    cachedRoot = null
  }

  const readPosts = (): ParsedPost[] => {
    if (cached !== null && cachedRoot === root) return cached

    const absoluteDir = postsDir()
    if (!fs.existsSync(absoluteDir)) {
      cached = []
      cachedRoot = root
      return cached
    }

    const posts = fs
      .readdirSync(absoluteDir)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((name) => {
        const raw = fs.readFileSync(path.join(absoluteDir, name), 'utf8')
        const { attributes, body } = fm(raw)
        const slug = String(attributes.slug ?? name.replace(/\.md$/, ''))

        return {
          id: slug,
          slug,
          title: String(attributes.title ?? slug),
          excerpt: String(attributes.excerpt ?? ''),
          date: String(attributes.date ?? ''),
          tags: asStringArray(attributes.tags),
          categories: asStringArray(attributes.categories),
          readingTime: asNumber(attributes.readingTime, estimateReadingTime(body)),
          featured: attributes.featured === true,
          file: name,
          body,
        }
      })

    // Newest first. The list view relies on this order.
    cached = posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    cachedRoot = root
    return cached
  }

  const generateManifest = (posts: ParsedPost[]): string => {
    const loaders = posts
      .map(
        (post) =>
          `  ${JSON.stringify(post.id)}: () => import(${JSON.stringify(
            POST_ID_PREFIX + post.id,
          )}).then((m) => m.default),`,
      )
      .join('\n')

    return [
      `export const posts = ${JSON.stringify(
        posts.map(({ file: _file, body: _body, ...meta }) => meta),
      )};`,
      '',
      '/** Each post body is a separate chunk, fetched only when opened. */',
      'const loaders = {',
      loaders,
      '};',
      '',
      'export const loadPostContent = (id) => {',
      '  const loader = loaders[id];',
      '  if (!loader) return Promise.reject(new Error(`Unknown post: ${id}`));',
      '  return loader();',
      '};',
      '',
      'export default posts;',
    ].join('\n')
  }

  /**
   * Point Vite at the virtual modules a changed post belongs to.
   *
   * The post bodies are virtual modules, so their ids are not file paths and
   * Vite's file-to-module map does not know about them: on its own it cannot
   * tell that `src/data/posts/foo.md` is what `virtual:post/foo` was built
   * from, and an edit to a post would leave the page showing the old text.
   *
   * Returning the modules from `handleHotUpdate` hands them back to Vite,
   * which invalidates them and reloads the page — the usual path for a change
   * that no module can accept.
   */
  const modulesFor = (server: ViteDevServer, file: string): ModuleNode[] => {
    const modules: ModuleNode[] = []

    const manifest = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID)
    if (manifest) modules.push(manifest)

    const post = readPosts().find(
      (candidate) => path.resolve(root, POSTS_DIR, candidate.file) === file,
    )
    if (post) {
      const body = server.moduleGraph.getModuleById(`\0${POST_ID_PREFIX}${post.id}`)
      if (body) modules.push(body)
    }

    return modules
  }

  return {
    name: 'andev0x:posts',
    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      const directory = postsDir()

      // The dev server watches the project root, so the posts directory is
      // already covered — no extra watch target is needed.

      const inPostsDir = (file: string): boolean => file.startsWith(directory)

      const onChange = (file: string): void => {
        if (!inPostsDir(file)) return
        invalidate()
      }

      // Adding or removing a post changes the manifest, which is a different
      // module from the one that was loaded. Nothing invalidates it on its
      // own, so the manifest is dropped and the page reloaded.
      const onStructureChange = (file: string): void => {
        if (!hasServed || !inPostsDir(file)) return
        invalidate()
        const manifest = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID)
        if (manifest) server.moduleGraph.invalidateModule(manifest)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('change', onChange)
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)
      server.watcher.on('add', onStructureChange)
      server.watcher.on('unlink', onStructureChange)
    },

    /**
     * A post changed: drop the parsed copy and hand Vite the modules to
     * invalidate.
     */
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(postsDir())) return
      invalidate()
      return modulesFor(ctx.server, ctx.file)
    },

    resolveId(id) {
      if (id === MANIFEST_ID) return RESOLVED_MANIFEST_ID
      if (id.startsWith(POST_ID_PREFIX)) return `\0${id}`
      return null
    },

    load(id) {
      const posts = readPosts()

      // One virtual module per post holding only the markdown body — the front
      // matter is stripped here at build time rather than shipped to the client.
      if (id.startsWith(`\0${POST_ID_PREFIX}`)) {
        const postId = id.slice(`\0${POST_ID_PREFIX}`.length)
        const post = posts.find((candidate) => candidate.id === postId)
        if (!post) return null
        if (this.meta?.watchMode) this.addWatchFile(path.resolve(root, POSTS_DIR, post.file))
        return `export default ${JSON.stringify(post.body)};`
      }

      if (id !== RESOLVED_MANIFEST_ID) return null

      hasServed = true

      // In dev, watch each markdown file so editing a post re-runs this plugin.
      if (this.meta?.watchMode) {
        for (const post of posts) this.addWatchFile(path.resolve(root, POSTS_DIR, post.file))
      }
      return generateManifest(posts)
    },
  }
}
