import type { APIRoute } from 'astro';
import { getDB, deleteSession } from '../../../lib/db';
import { createLogoutResponse } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['admin_session'];
    if (token) {
      const db = getDB({ locals } as any);
      await deleteSession(db, token);
    }

    return createLogoutResponse();
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the cookie even if DB operation fails
    return createLogoutResponse();
  }
};
