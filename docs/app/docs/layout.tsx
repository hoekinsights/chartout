import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      githubUrl="https://github.com/hoekinsights/chartout"
      links={[
        {
          type: 'icon',
          label: 'Website',
          text: 'Website',
          url: 'https://www.chartout.io',
          external: true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          ),
        },
      ]}
      themeSwitch={{ enabled: false }}
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
