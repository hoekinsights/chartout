// Prefix for raw fetch() calls and plain <img> tags referencing /public assets, which
// Next does NOT auto-prefix (unlike next/image and next/link). The site now serves at the
// root of docs.chartout.io, so this is empty. Keep it in sync with basePath in
// next.config.ts: if the site ever moves back under a path prefix, set both.
export const BASE_PATH = ''

export function withBasePath(path: string): string {
  return path.startsWith('/') ? `${BASE_PATH}${path}` : path
}
