/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  DB: D1Database;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  BREVO_SENDER_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  SITE_URL: string;
}

declare namespace App {
  interface Locals extends Record<string, unknown> {
    user?: { username: string };
  }
}
