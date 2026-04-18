import type { APIRoute } from 'astro';
import { getDB, getAllPages, updatePageContent } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDB({ locals } as any);
    const result = await getAllPages(db);
    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content GET error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { route, meta_title, meta_description, og_title, og_description, og_image, heading, body_content } = await request.json();

    if (!route) {
      return new Response(JSON.stringify({ error: 'Route requise.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);

    // Build update data object with only provided fields
    const data: Record<string, string> = {};
    if (meta_title !== undefined) data.meta_title = meta_title;
    if (meta_description !== undefined) data.meta_description = meta_description;
    if (og_title !== undefined) data.og_title = og_title;
    if (og_description !== undefined) data.og_description = og_description;
    if (og_image !== undefined) data.og_image = og_image;
    if (heading !== undefined) data.heading = heading;
    if (body_content !== undefined) data.body_content = body_content;

    await updatePageContent(db, route, data);

    return new Response(JSON.stringify({ success: true, route }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content PUT error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
