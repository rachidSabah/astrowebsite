import { validateSession, deleteSession } from './db';
import type { D1Database } from '@cloudflare/workers-types';

export async function requireAuth(request: Request, db: D1Database): Promise<{ username: string } | null> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
  
  const token = cookies['admin_session'];
  if (!token) return null;
  
  return validateSession(db, token);
}

export function createLoginResponse(token: string, redirectUrl: string = '/admin'): Response {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
    },
  });
}

export function createLogoutResponse(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
}
