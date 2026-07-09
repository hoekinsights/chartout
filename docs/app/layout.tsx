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
          ChartOut is in beta. Give it a try, and let me know what you think.
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
