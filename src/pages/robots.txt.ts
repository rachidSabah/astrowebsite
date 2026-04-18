import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.href || 'https://infohas-academy.pages.dev';

  return new Response(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}sitemap.xml
`, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
