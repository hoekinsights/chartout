import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import { remarkSteps } from 'fumadocs-core/mdx-plugins'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [...v, remarkSteps],
  },
})
