import type { APIRoute } from 'astro';

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changeFreq: 'weekly' },
  { url: '/a-propos', priority: '0.8', changeFreq: 'monthly' },
  { url: '/programmes', priority: '0.9', changeFreq: 'monthly' },
  { url: '/inscription', priority: '0.95', changeFreq: 'monthly' },
  { url: '/contact', priority: '0.7', changeFreq: 'monthly' },
];

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.href || 'https://infohas-academy.pages.dev';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
