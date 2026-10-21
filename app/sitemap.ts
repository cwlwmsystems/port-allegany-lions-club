import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portlionsclub.vercel.app';

  return ['', '/about', '/impact', '/events', '/join', '/contact'].map(
    path => ({
      url: new URL(path || '/', siteUrl).toString(),
      changeFrequency: 'monthly',
      priority: path === '' ? 1 : 0.7
    })
  );
}
