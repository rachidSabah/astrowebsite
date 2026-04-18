import type { APIRoute } from 'astro';
import { getDB, validateAdmin } from '../../../lib/db';
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

    const db = getDB({ locals } as any);
    const env = (locals as any)?.runtime?.env as any;

    if (!env) {
      return new Response(JSON.stringify({ error: 'Configuration serveur manquante.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await validateAdmin(db, username, password, env);

    if (session) {
      return createLoginResponse(session.token);
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
