import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{ defaultOpenLevel: Infinity }}
      nav={{
        // Point the logo at /docs, not "/". The root route is a server redirect with no
        // static RSC payload, so a basePath link to "/" makes Next prefetch /chartout.txt
        // (404). /docs has a real prefetch payload.
        url: '/docs',
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
