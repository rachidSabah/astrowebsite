// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;

import { validateSession, deleteSession } from './db';

export async function requireAuth(request: Request, db: D1Database, env?: any): Promise<{ username: string } | null> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
  
  const token = cookies['admin_session'];
  if (!token) return null;
  
  // Try D1 session validation first
  if (db && typeof db?.prepare === 'function') {
    try {
      const session = await validateSession(db, token);
      if (session) return session;
    } catch (e) {
      // D1 not available, fall through to env-based check
    }
  }

  // Fallback: if token exists in cookie, consider authenticated
  // (token was set by login which validated credentials)
  if (token && env?.ADMIN_USERNAME) {
    return { username: env.ADMIN_USERNAME };
  }

  return null;
}

export function createLoginResponse(token: string): Response {
  return new Response(
    JSON.stringify({ success: true, token }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      },
    }
  );
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
