'use client'
import type { ReactNode } from 'react'

export function ChartCell({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6">{children}</div>
}

export function StoreCell({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6">{children}</div>
}
