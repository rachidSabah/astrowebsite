import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  [key: string]: string;
}

// Helper to get D1 from Astro context
export function getDB(Astro: { locals: { runtime: { env: { DB: D1Database } } } }): D1Database {
  return Astro.locals.runtime.env.DB;
}

// ============ PAGES CONTENT CRUD ============
export async function getPageContent(db: D1Database, route: string) {
  return db.prepare('SELECT * FROM pages_content WHERE route = ?').bind(route).first();
}

export async function getAllPages(db: D1Database) {
  return db.prepare('SELECT * FROM pages_content ORDER BY route').all();
}

export async function updatePageContent(db: D1Database, route: string, data: {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  heading?: string;
  body_content?: string;
}) {
  const existing = await getPageContent(db, route);
  const fields = Object.entries(data).filter(([, v]) => v !== undefined);
  
  if (existing) {
    const sets = fields.map(([k]) => `${k} = ?`).join(', ');
    const values = [...fields.map(([, v]) => v), route];
    return db.prepare(`UPDATE pages_content SET ${sets}, updated_at = datetime('now') WHERE route = ?`).bind(...values).run();
  } else {
    const cols = fields.map(([k]) => k).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = [...fields.map(([, v]) => v), route];
    return db.prepare(`INSERT INTO pages_content (${cols}, route) VALUES (${placeholders}, ?)`).bind(...values).run();
  }
}

// ============ SUBMISSIONS ============
export async function createSubmission(db: D1Database, data: {
  type: 'enrollment' | 'contact';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  program?: string;
  message?: string;
  education_level?: string;
  date_of_birth?: string;
  city?: string;
  ip_address?: string;
  user_agent?: string;
}) {
  return db.prepare(`
    INSERT INTO submissions (type, first_name, last_name, email, phone, program, message, education_level, date_of_birth, city, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.type, data.first_name, data.last_name, data.email,
    data.phone || '', data.program || '', data.message || '',
    data.education_level || '', data.date_of_birth || '',
    data.city || '', data.ip_address || '', data.user_agent || ''
  ).run();
}

export async function getSubmissions(db: D1Database, type?: string, status?: string) {
  let query = 'SELECT * FROM submissions WHERE 1=1';
  const params: string[] = [];
  
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';
  
  return db.prepare(query).bind(...params).all();
}

export async function updateSubmissionStatus(db: D1Database, id: number, status: string) {
  return db.prepare("UPDATE submissions SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function getSubmissionCount(db: D1Database, type?: string) {
  if (type) {
    return db.prepare('SELECT COUNT(*) as count FROM submissions WHERE type = ? AND status = ?').bind(type, 'new').first();
  }
  return db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'new'").first();
}

// ============ REDIRECTS ============
export async function getRedirect(db: D1Database, sourcePath: string) {
  return db.prepare('SELECT * FROM redirects WHERE source_path = ? AND is_active = 1').bind(sourcePath).first();
}

export async function getAllRedirects(db: D1Database) {
  return db.prepare('SELECT * FROM redirects ORDER BY created_at DESC').all();
}

export async function createRedirect(db: D1Database, data: {
  source_path: string;
  target_path: string;
  status_code: number;
}) {
  return db.prepare(`
    INSERT INTO redirects (source_path, target_path, status_code)
    VALUES (?, ?, ?)
  `).bind(data.source_path, data.target_path, data.status_code).run();
}

export async function updateRedirect(db: D1Database, id: number, data: {
  source_path?: string;
  target_path?: string;
  status_code?: number;
  is_active?: number;
}) {
  const fields = Object.entries(data).filter(([, v]) => v !== undefined);
  const sets = fields.map(([k]) => `${k} = ?`).join(', ');
  const values = [...fields.map(([, v]) => v), id];
  return db.prepare(`UPDATE redirects SET ${sets}, updated_at = datetime('now') WHERE id = ?`).bind(...values).run();
}

export async function deleteRedirect(db: D1Database, id: number) {
  return db.prepare('DELETE FROM redirects WHERE id = ?').bind(id).run();
}

export async function incrementRedirectHitCount(db: D1Database, id: number) {
  return db.prepare('UPDATE redirects SET hit_count = hit_count + 1 WHERE id = ?').bind(id).run();
}

// ============ SEO SETTINGS ============
export async function getSeoSetting(db: D1Database, key: string) {
  const result = await db.prepare('SELECT setting_value FROM seo_settings WHERE setting_key = ?').bind(key).first();
  return result?.setting_value || '';
}

// ============ ADMIN AUTH ============
export async function validateAdmin(db: D1Database, username: string, password: string, env: { ADMIN_USERNAME: string; ADMIN_PASSWORD: string }) {
  // Simple auth against env vars - in production, use hashed passwords
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.prepare(
      'INSERT INTO admin_sessions (session_token, username, ip_address, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(token, username, '', expiresAt).run();
    return { token, expiresAt };
  }
  return null;
}

export async function validateSession(db: D1Database, token: string) {
  const session = await db.prepare(
    'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > datetime("now")'
  ).bind(token).first<{ username: string; expires_at: string }>();
  return session ? { username: session.username } : null;
}

export async function deleteSession(db: D1Database, token: string) {
  return db.prepare('DELETE FROM admin_sessions WHERE session_token = ?').bind(token).run();
}
