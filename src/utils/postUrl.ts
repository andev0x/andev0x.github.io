/**
 * Post links live in the URL *fragment*, not the path.
 *
 * The site is deployed as static files with no host-side rewrites, so a real
 * path (`/posts/foo`) would 404 on reload or on a shared link unless every URL
 * were rewritten to `index.html`. A fragment is resolved entirely by the browser
 * and costs the host nothing.
 *
 * `#/post/<id>` rather than a bare `#<id>` so a post link can never collide with
 * a same-page anchor — post headings are slugified into ids (see `Markdown.tsx`),
 * so `#installation` is already a legitimate fragment.
 */

const POST_ROUTE = /^#\/post\/(.+)$/;

/**
 * What the fragment means.
 *
 * `other` exists so an in-page anchor (`#installation`, the `#main` skip link) is
 * never mistaken for "leave the post". Treating every unrecognised fragment as a
 * navigation back to the list would close an open post the moment a reader
 * followed a heading link.
 */
export type Route =
  | { kind: 'post'; id: string }
  | { kind: 'list' }
  | { kind: 'other' };

export const postFragment = (id: string): string => `#/post/${encodeURIComponent(id)}`;

export const routeFromHash = (hash: string): Route => {
  const match = POST_ROUTE.exec(hash);
  if (match) return { kind: 'post', id: decodeURIComponent(match[1]) };
  // `''` is the list. `'#'` is what some browsers leave behind after the
  // fragment is cleared, and it means the same thing.
  return hash === '' || hash === '#' ? { kind: 'list' } : { kind: 'other' };
};

/**
 * Absolute URL for a post, for the clipboard.
 *
 * Built from `origin` + `pathname` rather than `href` so any fragment or query
 * the reader is currently sitting on is dropped instead of being baked into a
 * link that is supposed to point at a post.
 */
export const postUrl = (id: string): string =>
  `${window.location.origin}${window.location.pathname}${postFragment(id)}`;