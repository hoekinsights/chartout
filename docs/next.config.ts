import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'
const withMDX = createMDX()

const config: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/chartout' : '',
  images: { unoptimized: true },
  transpilePackages: ['fumadocs-ui', 'fumadocs-core'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'skia-canvas',
      ]
    }
    return config
  },
}

export default withMDX(config)
