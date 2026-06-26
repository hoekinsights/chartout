'use client'
import dynamic from 'next/dynamic'

// chartout/react bundles skia-canvas which accesses `window` at module init time,
// so demo components must be loaded client-only (ssr: false).
export const VizLikeDemo = dynamic(
  () => import('./VizLikeDemo').then((m) => ({ default: m.VizLikeDemo })),
  { ssr: false },
)
export const CartItemDemo = dynamic(
  () => import('./CartItemDemo').then((m) => ({ default: m.CartItemDemo })),
  { ssr: false },
)
export const CartDemo = dynamic(
  () => import('./CartDemo').then((m) => ({ default: m.CartDemo })),
  { ssr: false },
)
