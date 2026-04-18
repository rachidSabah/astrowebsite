interface SeoData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

const SITE_NAME = 'INFOHAS Academy';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

export function generateMetaTags(data: SeoData, siteUrl: string) {
  const title = data.ogTitle || data.title;
  const description = data.ogDescription || data.description;
  const ogImage = new URL(data.ogImage || DEFAULT_OG_IMAGE, siteUrl).href;
  const canonical = data.canonical ? new URL(data.canonical, siteUrl).href : '';

  return {
    title: data.title,
    meta: [
      { name: 'description', content: data.description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: data.type || 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'fr_FR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      ...(data.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      ...(canonical ? [{ rel: 'canonical', href: canonical }] : []),
    ],
  };
}

export function generateLocalBusinessJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'INFOHAS Academy',
    alternateName: 'Institut de Formation d\'Hôtesses de l\'Air et Stewards',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: 'Académie de référence au Maroc pour la formation du personnel navigant commercial. Accréditation d\'État, simulateurs de vol, partenariats internationaux.',
    foundingDate: '1996-07-07',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '15 Rue Demnate',
      addressLocality: 'Rabat',
      addressRegion: 'Rabat-Salé-Kénitra',
      postalCode: '10000',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212-537-76-20-25',
      contactType: 'admissions',
      availableLanguage: ['French', 'English', 'Arabic'],
    },
    sameAs: [
      'https://www.facebook.com/GroupeInfohas',
      'https://x.com/Groupeinfohas',
      'https://www.instagram.com/infohas.cabincrew/',
      'https://www.linkedin.com/company-beta/5237641/',
      'https://www.youtube.com/user/HOTESSE12',
    ],
    knowsAbout: ['Formation PNC', 'Aviation Civile', 'Personnel Navigant Commercial', 'Hôtesse de l\'Air', 'Steward'],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 34.0209, longitude: -6.8416 },
      geoRadius: '50000',
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
