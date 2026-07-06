import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'
const withMDX = createMDX()

const config: NextConfig = {
  output: 'export',
  // Served at the root of the custom domain (docs.chartout.io), so no path prefix.
  // If you ever revert to the hoekinsights.github.io/chartout/ project path, restore
  // basePath to '/chartout' here AND in lib/basePath.ts.
  basePath: '',
  images: { unoptimized: true },
  transpilePackages: ['fumadocs-ui', 'fumadocs-core'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'skia-canvas',
        'canvas',
      ]
    }
    return config
  },
}

export default withMDX(config)
