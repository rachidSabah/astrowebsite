import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip for assets, API routes, and static files
  if (
    path.startsWith('/_astro') ||
    path.startsWith('/api') ||
    path.startsWith('/_image') ||
    path.includes('.')
  ) {
    return next();
  }

  // Only check redirects for non-admin paths when D1 is available
  if (!path.startsWith('/admin')) {
    try {
      const env = (locals as any)?.runtime?.env;
      const db: any = env?.DB;
      if (db && typeof db.prepare === 'function') {
        const redirect = await db
          .prepare('SELECT * FROM redirects WHERE source_path = ? AND is_active = 1')
          .bind(path)
          .first();

        if (redirect) {
          db.prepare('UPDATE redirects SET hit_count = hit_count + 1 WHERE id = ?')
            .bind(redirect.id)
            .run()
            .catch(() => {});

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
      // D1 not available or redirect check failed - continue to page
    }
  }

  return next();
};
