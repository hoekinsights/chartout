// The site is served under a basePath in production (see next.config.ts). Next only
// auto-applies that prefix to next/image and next/link, NOT to raw fetch() calls or
// plain <img> tags referencing /public assets. Use withBasePath() for those so they
// resolve in both dev (basePath '') and production (basePath '/chartout').
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/chartout' : ''

export function withBasePath(path: string): string {
  return path.startsWith('/') ? `${BASE_PATH}${path}` : path
}
