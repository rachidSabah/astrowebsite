-- INFOHAS Academy Database Schema for Cloudflare D1

-- =============================================
-- TABLE: pages_content
-- Stores editable page content for the CMS
-- =============================================
CREATE TABLE IF NOT EXISTS pages_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_title TEXT DEFAULT '',
  og_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  heading TEXT DEFAULT '',
  body_content TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: submissions (enrollment + contact forms)
-- =============================================
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('enrollment', 'contact')),
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied', 'archived')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  program TEXT DEFAULT '',
  message TEXT DEFAULT '',
  education_level TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  city TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: redirects (SEO redirect manager)
-- =============================================
CREATE TABLE IF NOT EXISTS redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301 CHECK(status_code IN (301, 302)),
  is_active INTEGER DEFAULT 1,
  hit_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: admin_sessions
-- =============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: seo_settings (global SEO configuration)
-- =============================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_route ON pages_content(route);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

-- =============================================
-- SEED DATA: Default page content
-- =============================================
INSERT INTO pages_content (route, title, meta_title, meta_description, heading, body_content) VALUES
('index', 'Accueil - INFOHAS Academy',
 'INFOHAS Academy | Formation Hôtesse de l''Air & Steward à Rabat',
 'Institut de référence au Maroc pour la formation PNC accréditée. Simulateurs Boeing/Airbus, 95% de placement, partenariats Emirates & Qatar Airways. Inscrivez-vous !',
 'Votre Carrière dans l''Aviation Commence Ici',
 'L''académie INFOHAS, fondée en 1996 à Rabat, est l''établissement de référence au Maroc pour la préparation aux métiers du personnel navigant commercial. Avec plus de trois décennies d''expertise, nous formons les futures hôtesses de l''air et stewards qui rejoignent les compagnies les plus prestigieuses au monde.'),

('a-propos', 'À Propos - INFOHAS Academy',
 'À Propos | INFOHAS Academy - 30 Ans d''Excellence Aéronautique',
 'Découvrez INFOHAS Academy : 30 ans d''expérience, accréditation d''État, simulateurs de vol et un réseau de 3500+ diplômés dans les compagnies aériennes internationales.',
 'Une Héritage d''Excellence Depuis 1996',
 'Fondé le 7 juillet 1996, l''Institut INFOHAS s''est forgé une réputation solide dans le paysage de la formation aéronautique marocaine. Notre mission est de préparer les futurs professionnels de l''aviation aux standards les plus exigeants de l''industrie.'),

('programmes', 'Nos Programmes - INFOHAS Academy',
 'Formations PNC & Aviation | INFOHAS Academy Rabat',
 'Explorez nos formations accréditées : Hôtesse de l''Air, Steward, Hôtesse d''Accueil et Agent Aéroportuaire. Diplôme d''État, simulateurs, coaching carrière.',
 'Des Formations Conçues pour l''Excellence',
 'Nos programmes de formation couvrent l''ensemble des métiers de l''aviation civile et de l''hospitalité, tous conçus selon les normes internationales de l''OACI et de la DGAC.'),

('inscription', 'Inscription - INFOHAS Academy',
 'Inscription Formation PNC | INFOHAS Academy Rabat',
 'Inscrivez-vous à la formation Hôtesse de l''Air & Steward. Évaluation gratuite, accompagnement personnalisé. Sessions Juillet, Septembre et Octobre.',
 'Rejoignez Notre Prochaine Promotion',
 'L''inscription à INFOHAS Academy est votre première étape vers une carrière dans l''aviation internationale. Remplissez le formulaire ci-dessous et notre équipe vous contactera pour une évaluation personnalisée.'),

('contact', 'Contact - INFOHAS Academy',
 'Contact | INFOHAS Academy - École d''Aviation Rabat',
 'Contactez INFOHAS Academy : 15 Rue Demnate, Hassan, Rabat. Tél : +212 537 76 20 25. Réponse sous 24h pour toute question sur nos formations.',
 'Parlons de Votre Avenir dans l''Aviation',
 'Notre équipe est à votre disposition pour répondre à toutes vos questions concernant nos programmes de formation, les conditions d''admission et les perspectives de carrière dans l''aviation.');

-- Seed SEO settings
INSERT INTO seo_settings (setting_key, setting_value) VALUES
('site_name', 'INFOHAS Academy'),
('default_og_image', '/images/og-default.jpg'),
('canonical_domain', 'https://infohas-academy.pages.dev'),
('twitter_handle', '@Groupeinfohas');

-- Seed default admin (password: Infohas@2024)
INSERT INTO admin_sessions (session_token, username, ip_address, user_agent, expires_at) VALUES
('init-placeholder', 'system', '', '', '2099-01-01 00:00:00');
