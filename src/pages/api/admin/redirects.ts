import type { APIRoute } from 'astro';
import { getDB, getAllRedirects, createRedirect, updateRedirect, deleteRedirect } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDB({ locals } as any);
    const result = await getAllRedirects(db);
    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Redirects GET error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { source_path, target_path, status_code } = await request.json();

    if (!source_path || !target_path || !status_code) {
      return new Response(JSON.stringify({ error: 'Tous les champs sont requis: source_path, target_path, status_code.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);
    await createRedirect(db, {
      source_path: source_path.startsWith('/') ? source_path : '/' + source_path,
      target_path,
      status_code: parseInt(status_code),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Redirects POST error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la création.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { id, source_path, target_path, status_code, is_active } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requis.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);

    const data: Record<string, any> = {};
    if (source_path !== undefined) data.source_path = source_path;
    if (target_path !== undefined) data.target_path = target_path;
    if (status_code !== undefined) data.status_code = parseInt(status_code);
    if (is_active !== undefined) data.is_active = is_active ? 1 : 0;

    await updateRedirect(db, parseInt(id), data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Redirects PUT error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requis.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);
    await deleteRedirect(db, parseInt(id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Redirects DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la suppression.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
