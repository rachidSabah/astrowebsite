interface BrevoEmailOptions {
  to: string[];
  subject: string;
  htmlContent: string;
  replyTo?: string;
}

interface BrevoApiResponse {
  messageId?: string;
  message?: string;
}

export async function sendBrevoEmail(env: {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  BREVO_SENDER_NAME: string;
}, options: BrevoEmailOptions): Promise<BrevoApiResponse> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: env.BREVO_SENDER_NAME,
        email: env.BREVO_SENDER_EMAIL,
      },
      to: options.to.map(email => ({ email })),
      subject: options.subject,
      htmlContent: options.htmlContent,
      replyTo: options.replyTo ? { email: options.replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Brevo API error:', error);
    throw new Error(`Brevo API error: ${response.status}`);
  }

  return response.json();
}

export function buildEnrollmentNotificationEmail(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program: string;
  education_level: string;
  city: string;
  date_of_birth: string;
}): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nouvelle Candidature - INFOHAS Academy</h1>
      </div>
      <div style="padding: 30px;">
        <p style="color: #64748b; font-size: 14px;">Une nouvelle demande d'inscription a été soumise.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Informations du Candidat</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Nom complet</td><td style="padding: 8px 0; color: #1e293b;">${data.first_name} ${data.last_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email</td><td style="padding: 8px 0; color: #1e293b;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Téléphone</td><td style="padding: 8px 0; color: #1e293b;">${data.phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Programme souhaité</td><td style="padding: 8px 0; color: #1e293b;">${data.program}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Niveau d'études</td><td style="padding: 8px 0; color: #1e293b;">${data.education_level}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Ville</td><td style="padding: 8px 0; color: #1e293b;">${data.city}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date de naissance</td><td style="padding: 8px 0; color: #1e293b;">${data.date_of_birth}</td></tr>
          </table>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Cet email a été envoyé automatiquement par le formulaire d'inscription INFOHAS Academy.</p>
      </div>
    </div>
  `;
}

export function buildContactNotificationEmail(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nouveau Message de Contact</h1>
      </div>
      <div style="padding: 30px;">
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0;">Détails du Contact</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Nom</td><td style="padding: 8px 0; color: #1e293b;">${data.first_name} ${data.last_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email</td><td style="padding: 8px 0; color: #1e293b;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Téléphone</td><td style="padding: 8px 0; color: #1e293b;">${data.phone}</td></tr>
          </table>
          <h3 style="color: #1e293b; margin-top: 20px;">Message</h3>
          <p style="color: #334155; background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.6;">${data.message}</p>
        </div>
      </div>
    </div>
  `;
}

export function buildConfirmationEmail(data: {
  first_name: string;
  type: 'enrollment' | 'contact';
}): string {
  const isEnrollment = data.type === 'enrollment';
  const title = isEnrollment ? 'Votre Candidature a Bien Été Reçue' : 'Votre Message a Bien Été Envoyé';
  const description = isEnrollment
    ? 'Nous avons bien reçu votre demande d\'inscription à INFOHAS Academy. Notre équipe d\'admissions examinera votre dossier et vous contactera dans les plus brefs délais.'
    : 'Nous avons bien reçu votre message. Notre équipe vous répondra dans les 24 à 48 heures ouvrables.';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Bonjour <strong>${data.first_name}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">${description}</p>
        ${isEnrollment ? `
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #1e40af;"><strong>Prochaines étapes :</strong></p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #334155;">
            <li>Réception de votre dossier</li>
            <li>Évaluation par notre équipe d'admissions</li>
            <li>Convocation à un entretien</li>
            <li>Confirmation de votre admission</li>
          </ul>
        </div>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px;">Vous pouvez nous contacter à tout moment :</p>
          <p style="color: #1e293b; font-weight: 600;">+212 537 76 20 25</p>
          <p style="color: #1e293b; font-weight: 600;">contact@infohas.ma</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
          INFOHAS Academy - 15 Rue Demnate, Hassan, Rabat, Maroc
        </p>
      </div>
    </div>
  `;
}
