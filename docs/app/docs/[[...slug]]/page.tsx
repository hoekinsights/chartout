import { source } from '@/lib/source'
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page'
import { notFound, redirect } from 'next/navigation'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (!slug || slug.length === 0) redirect('/docs/introduction/what-is-chartout')
  const page = source.getPage(slug)
  if (!page) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { body: MDX, toc, full } = page.data as any

  return (
    <DocsPage toc={toc} full={full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!slug || slug.length === 0) return { title: 'ChartOut' }
  const page = source.getPage(slug)
  if (!page) notFound()
  return {
    title: page.data.title,
    description: page.data.description,
  }
}
