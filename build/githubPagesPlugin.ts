import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * GitHub Pages serves `404.html` for any path it cannot resolve. Copying the
 * built shell there means a deep link or a reload still boots the app instead
 * of showing GitHub's default 404 page.
 *
 * The site routes through the URL fragment (`#/post/<id>`), so the shell itself
 * resolves the route without any host-side rewrite. This file is the safety net
 * for paths that are not the site root.
 */
export function githubPagesPlugin(): Plugin {
  let outDir = ''

  return {
    name: 'andev0x:github-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const index = path.join(outDir, 'index.html')
      if (!fs.existsSync(index)) return

      fs.copyFileSync(index, path.join(outDir, '404.html'))
      // GitHub Pages' Jekyll pipeline would otherwise ignore files and folders
      // whose names begin with an underscore.
      fs.writeFileSync(path.join(outDir, '.nojekyll'), '')
    },
  }
}
