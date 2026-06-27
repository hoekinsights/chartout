import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{ defaultOpenLevel: Infinity }}
      nav={{
        title: (
          <span className="font-semibold text-xl" style={{ color: '#1b195d', fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600 }}>
            ChartOut
          </span>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
