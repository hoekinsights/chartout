import { RootProvider } from 'fumadocs-ui/provider'
import { Banner } from 'fumadocs-ui/components/banner'
import type { ReactNode } from 'react'
// required: without it the entire docs site renders unstyled.
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Banner>
          <span>
            ChartOut is in beta. Give it a try, and let me know what you think by{' '}
            <a
              href="https://github.com/hoekinsights/chartout/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              opening a GitHub issue
            </a>
            .
          </span>
        </Banner>
        <RootProvider
          search={{ enabled: false }}
          theme={{ defaultTheme: 'light', forcedTheme: 'light', enableSystem: false }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
