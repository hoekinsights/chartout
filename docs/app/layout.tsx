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
            ChartOut is in beta. I&apos;d love your feedback, open a{' '}
            <a
              href="https://github.com/hoekinsights/chartout/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              GitHub issue
            </a>{' '}
            or email{' '}
            <a href="mailto:info@chartout.io" className="underline font-medium">
              info@chartout.io
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
