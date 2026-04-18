import type { APIRoute } from 'astro';
import { createLoginResponse } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Identifiants requis.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Access env from Cloudflare Pages runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env: any = (locals as any)?.runtime?.env;

    if (!env) {
      return new Response(JSON.stringify({ error: 'Configuration serveur manquante.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validUser = env.ADMIN_USERNAME;
    const validPass = env.ADMIN_PASSWORD;

    if (username === validUser && password === validPass) {
      // Generate a session token
      const token = crypto.randomUUID();

      // Try to store in D1 (optional — doesn't block login)
      try {
        const db = env.DB;
        if (db && typeof db.prepare === 'function') {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          await db
            .prepare('INSERT INTO admin_sessions (session_token, username, ip_address, expires_at) VALUES (?, ?, ?, ?)')
            .bind(token, username, request.headers.get('CF-Connecting-IP') || '', expiresAt)
            .run();
        }
      } catch (dbError) {
        // D1 not available — continue without session storage
        console.warn('D1 session storage unavailable, using cookie-only auth:', dbError);
      }

      return createLoginResponse(token);
    }

    return new Response(JSON.stringify({ error: 'Identifiants incorrects.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
