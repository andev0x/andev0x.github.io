import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import type { Plugin } from 'vite'

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

  const readPosts = (): Array<PostMeta & { file: string; body: string }> => {
    const absoluteDir = path.resolve(root, POSTS_DIR)
    if (!fs.existsSync(absoluteDir)) return []

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
    return posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }

  const generateManifest = (posts: Array<PostMeta & { file: string }>): string => {
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
        posts.map(({ file: _file, ...meta }) => meta),
      )};`,
      '',
      '/** Each post body is a separate chunk, fetched only when opened. */',
      'export const loaders = {',
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

  return {
    name: 'andev0x:posts',
    configResolved(config) {
      root = config.root
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

      // In dev, watch each markdown file so editing a post re-runs this plugin.
      if (this.meta?.watchMode) {
        for (const post of posts) this.addWatchFile(path.resolve(root, POSTS_DIR, post.file))
      }
      return generateManifest(posts)
    },
  }
}
