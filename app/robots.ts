import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portlionsclub.vercel.app';

  // Keep the site out of search indexes until launch is approved.
  const allowIndexing = process.env.ENABLE_INDEXING === 'true';

  return {
    rules: {
      userAgent: '*',
      allow: allowIndexing ? '/' : undefined,
      disallow: allowIndexing ? undefined : '/'
    },
    sitemap: allowIndexing
      ? new URL('/sitemap.xml', siteUrl).toString()
      : undefined
  };
}
