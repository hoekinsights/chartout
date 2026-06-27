import { RootProvider } from 'fumadocs-ui/provider'
import { Banner } from 'fumadocs-ui/components/banner'
import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Banner>ChartOut is coming soon. Stay tuned!</Banner>
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  )
}
