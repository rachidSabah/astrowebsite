import type { APIRoute } from 'astro';
import { getDB, createSubmission } from '../../lib/db';
import { sendBrevoEmail, buildContactNotificationEmail, buildConfirmationEmail } from '../../lib/brevo';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, message } = body;

    // Server-side validation
    if (!first_name || !last_name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Veuillez remplir tous les champs obligatoires.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);

    // Save to D1
    await createSubmission(db, {
      type: 'contact',
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      message: message.trim(),
      ip_address: request.headers.get('CF-Connecting-IP') || '',
      user_agent: request.headers.get('User-Agent') || '',
    });

    // Send emails via Brevo
    const env = locals.runtime?.env;
    if (env?.BREVO_API_KEY) {
      try {
        // Admin notification
        await sendBrevoEmail(env, {
          to: [env.ADMIN_EMAIL || 'contact@infohas.ma'],
          subject: `Nouveau Contact: ${first_name} ${last_name}`,
          htmlContent: buildContactNotificationEmail({
            first_name, last_name, email, phone: phone || '', message,
          }),
        });

        // Applicant confirmation
        await sendBrevoEmail(env, {
          to: [email.trim()],
          subject: 'Votre Message a Bien Été Envoyé - INFOHAS Academy',
          htmlContent: buildConfirmationEmail({ first_name: first_name.trim(), type: 'contact' }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les 24 heures.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact error:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
