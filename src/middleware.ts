import { defineMiddleware } from 'astro:middleware';
import { getRedirect, incrementRedirectHitCount } from './lib/db';
import type { D1Database } from '@cloudflare/workers-types';

export const onRequest = defineMiddleware(async ({ request, locals, next }, { routePattern }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip for assets, API routes, and files with extensions
  if (
    path.startsWith('/_astro') ||
    path.startsWith('/api') ||
    path.startsWith('/_image') ||
    path.includes('.') // static files like .css, .js, .png, etc.
  ) {
    return next();
  }

  // Only check redirects for non-admin paths
  if (!path.startsWith('/admin')) {
    try {
      const db = (locals.runtime?.env as any)?.DB as D1Database | undefined;
      if (db) {
        const redirect = await getRedirect(db, path);
        if (redirect) {
          // Increment hit count (fire and forget)
          incrementRedirectHitCount(db, redirect.id as number).catch(() => {});

          const targetUrl = redirect.target_path.startsWith('http')
            ? redirect.target_path
            : `${url.origin}${redirect.target_path}`;

          return new Response(null, {
            status: redirect.status_code as number,
            headers: { 'Location': targetUrl },
          });
        }
      }
    } catch (error) {
      // Continue to page if redirect check fails
      console.error('Redirect middleware error:', error);
    }
  }

  return next();
});
