import { loader } from 'fumadocs-core/source'
import { resolveFiles } from 'fumadocs-mdx'
import { docs } from '@/.source'

export const source = loader({
  baseUrl: '/docs',
  source: {
    files: resolveFiles({ docs: docs.docs, meta: docs.meta }),
  },
})
