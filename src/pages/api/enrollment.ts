import type { APIRoute } from 'astro';
import { getDB, createSubmission } from '../../lib/db';
import { sendBrevoEmail, buildEnrollmentNotificationEmail, buildConfirmationEmail } from '../../lib/brevo';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, date_of_birth, education_level, city, program } = body;

    // Server-side validation
    if (!first_name || !last_name || !email || !phone || !date_of_birth || !education_level || !city || !program) {
      return new Response(JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis.' }), {
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

    // Phone validation (Moroccan format)
    const cleanPhone = String(phone).replace(/\s/g, '');
    const phoneRegex = /^(0[5-7]\d{8}|\+212[5-7]\d{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      return new Response(JSON.stringify({ error: 'Format de téléphone invalide. Utilisez le format 06XXXXXXXX ou +2126XXXXXXXX.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB({ locals } as any);

    // Save to D1
    await createSubmission(db, {
      type: 'enrollment',
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      program: program.trim(),
      education_level: education_level.trim(),
      date_of_birth: date_of_birth.trim(),
      city: city.trim(),
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
          subject: `Nouvelle Candidature: ${first_name} ${last_name} - ${program}`,
          htmlContent: buildEnrollmentNotificationEmail({
            first_name, last_name, email, phone: cleanPhone, program,
            education_level, city, date_of_birth,
          }),
        });

        // Applicant confirmation
        await sendBrevoEmail(env, {
          to: [email.trim()],
          subject: 'Votre Candidature INFOHAS Academy a Bien Été Reçue',
          htmlContent: buildConfirmationEmail({ first_name: first_name.trim(), type: 'enrollment' }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Votre candidature a été soumise avec succès. Notre équipe vous contactera prochainement.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
