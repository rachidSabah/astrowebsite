import type { APIRoute } from 'astro';
import { getDB, getSubmissions, updateSubmissionStatus } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = getDB({ locals } as any);
    const type = url.searchParams.get('type') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const result = await getSubmissions(db, type, status);

    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Submissions GET error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'ID et statut requis.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate status
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);
    await updateSubmissionStatus(db, parseInt(id), status);

    return new Response(JSON.stringify({ success: true, id, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Submissions PUT error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
