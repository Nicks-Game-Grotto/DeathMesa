import { type GetStaticProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'

/**
 * Use Incremental Static Regeneration (ISR)
 * - First request generates the page
 * - Cached for 60 seconds
 * - Cloudflare serves the cached page on subsequent requests
 */
export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params?.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return {
      props,
      revalidate: 60 // ✅ cache for 60s, avoids building all pages upfront
    }
  } catch (err) {
    console.error('Page build error', domain, rawPageId, err)

    // Instead of failing the build, fallback to 404 to prevent crashing deploy
    return {
      notFound: true,
      revalidate: 30
    }
  }
}

/**
 * Dynamic paths configuration
 * - We no longer pre-render ALL Notion pages at build time.
 * - Use fallback: 'blocking' to build pages only on first request.
 */
export async function getStaticPaths() {
  return {
    paths: [], // ✅ Don't statically pre-generate hundreds of pages
    fallback: 'blocking' // ✅ Builds pages on-demand + caches them
  }
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}
