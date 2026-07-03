'use client'
import dynamic from 'next/dynamic'

// chartout/react bundles skia-canvas which accesses `window` at module init time,
// so demo components must be loaded client-only (ssr: false).
export const ChartOutput = dynamic(
  () => import('./output').then((m) => ({ default: m.ChartOutput })),
  { ssr: false },
)
export const StoreOutput = dynamic(
  () => import('./output').then((m) => ({ default: m.StoreOutput })),
  { ssr: false },
)
export const ChartPreview = dynamic(
  () => import('./GettingStartedDemo').then((m) => ({ default: m.ChartPreview })),
  { ssr: false },
)
export const StorePreview = dynamic(
  () => import('./GettingStartedDemo').then((m) => ({ default: m.StorePreview })),
  { ssr: false },
)
