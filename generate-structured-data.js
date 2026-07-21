const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const siteUrl = 'https://www.tutorservices.in';
const businessId = `${siteUrl}/#business`;
const websiteId = `${siteUrl}/#website`;
const editorialTeamId = `${siteUrl}/#editorial-team`;
const founderId = `${siteUrl}/#founder`;
const contentReviewDate = '2026-07-21T00:00:00+05:30';

function toCleanPath(fileOrPath) {
  if (fileOrPath === '/' || fileOrPath === 'index.html' || fileOrPath === '/index.html') return '/';
  return `/${path.basename(fileOrPath, '.html').toLowerCase()}`;
}

const pageConfig = {
  'index.html': { pageType: 'WebPage', breadcrumbs: [] },
  'about.html': { pageType: 'AboutPage', breadcrumbs: [['Home', '/'], ['About', '/about.html']] },
  'services.html': { pageType: 'CollectionPage', breadcrumbs: [['Home', '/'], ['Services', '/services.html']] },
  'courses.html': { pageType: 'CollectionPage', breadcrumbs: [['Home', '/'], ['Courses', '/courses.html']] },
  'home-tuition.html': { pageType: 'WebPage', breadcrumbs: [['Home', '/'], ['Home Tuition', '/home-tuition.html']], serviceType: 'Home Tuition' },
  'online-tuition.html': { pageType: 'WebPage', breadcrumbs: [['Home', '/'], ['Online Tuition', '/online-tuition.html']], serviceType: 'Online Tuition' },
  'classes.html': { pageType: 'CollectionPage', breadcrumbs: [['Home', '/'], ['Classes', '/classes.html']] },
  'exam-preparation.html': { pageType: 'WebPage', breadcrumbs: [['Home', '/'], ['Exam Preparation', '/exam-preparation.html']], serviceType: 'Exam Preparation Tuition' },
  'student-registration.html': { pageType: 'WebPage', breadcrumbs: [['Home', '/'], ['Student Registration', '/student-registration.html']] },
  'tutor-registration.html': { pageType: 'WebPage', breadcrumbs: [['Home', '/'], ['Tutor Registration', '/tutor-registration.html']] },
  'contact.html': { pageType: 'ContactPage', breadcrumbs: [['Home', '/'], ['Contact', '/contact.html']] },
  'locations.html': { pageType: 'CollectionPage', breadcrumbs: [['Home', '/'], ['Locations', '/locations.html']] },
  'blog.html': { pageType: 'CollectionPage', breadcrumbs: [['Home', '/'], ['Blog', '/blog.html']], isBlog: true },
  'best-home-tuition-services-india.html': {
    pageType: 'WebPage',
    breadcrumbs: [['Home', '/'], ['Blog', '/blog.html'], ['Best Home Tuition Services in India', '/best-home-tuition-services-india.html']],
    isArticle: true,
    datePublished: '2026-07-20T00:00:00+05:30'
  },
  'benefits-of-home-tuition.html': {
    pageType: 'WebPage',
    breadcrumbs: [['Home', '/'], ['Blog', '/blog.html'], ['Benefits of Home Tuition', '/benefits-of-home-tuition.html']],
    isArticle: true,
    datePublished: '2026-07-20T00:00:00+05:30'
  },
  'online-learning-tips.html': {
    pageType: 'WebPage',
    breadcrumbs: [['Home', '/'], ['Blog', '/blog.html'], ['Online Learning Tips', '/online-learning-tips.html']],
    isArticle: true,
    datePublished: '2026-07-20T00:00:00+05:30'
  },
  'class-10-board-exam-preparation.html': {
    pageType: 'WebPage',
    breadcrumbs: [['Home', '/'], ['Blog', '/blog.html'], ['Class 10 Board Exam Preparation', '/class-10-board-exam-preparation.html']],
    isArticle: true,
    datePublished: '2026-07-20T00:00:00+05:30'
  },
  'spoken-english-guide.html': {
    pageType: 'WebPage',
    breadcrumbs: [['Home', '/'], ['Blog', '/blog.html'], ['Spoken English Guide', '/spoken-english-guide.html']],
    isArticle: true,
    datePublished: '2026-07-20T00:00:00+05:30'
  }
};

const articleFiles = Object.entries(pageConfig)
  .filter(([, config]) => config.isArticle)
  .map(([fileName]) => fileName);

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
}

function cleanText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractRequired(html, pattern, label, fileName) {
  const match = html.match(pattern);
  if (!match) throw new Error(`Missing ${label} in ${fileName}`);
  return cleanText(match[1]);
}

function extractMetaContent(html, key, attribute = 'name') {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="([^"]+)"`, 'i');
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : '';
}

function createBusiness(includeReviews = []) {
  const business = {
    '@type': ['Organization', 'LocalBusiness', 'EducationalOrganization'],
    '@id': businessId,
    name: 'Tutorservices',
    alternateName: 'Tutorservices.in',
    url: `${siteUrl}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteUrl}/#logo`,
      url: `${siteUrl}/assets/tutor-services-logo.webp`,
      contentUrl: `${siteUrl}/assets/tutor-services-logo.webp`,
      caption: 'Tutorservices logo'
    },
    image: { '@id': `${siteUrl}/#logo` },
    slogan: 'Learn Smarter, Achieve Faster',
    description: 'Home tuition and online tutoring service connecting students and parents with tutors for academic subjects, board examinations and skill-based courses.',
    founder: {
      '@type': 'Person',
      '@id': founderId,
      name: 'Meenakshi Sharma'
    },
    email: 'tutorservices.in@gmail.com',
    telephone: '+91-7011090796',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN'
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: 'New Delhi' }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+91-7011090796',
      email: 'tutorservices.in@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi']
    },
    knowsAbout: [
      'Home Tuition',
      'Online Tuition',
      'CBSE Tuition',
      'ICSE Tuition',
      'State Board Tuition',
      'Spoken English',
      'Computer Courses',
      'Competitive Exam Preparation'
    ]
  };

  if (includeReviews.length) {
    business.review = includeReviews.map((review) => ({ '@id': review['@id'] }));
  }

  return business;
}

function createFounder() {
  return {
    '@type': 'Person',
    '@id': founderId,
    name: 'Meenakshi Sharma',
    jobTitle: 'Founder',
    worksFor: { '@id': businessId },
    url: `${siteUrl}/about`
  };
}

function createEditorialTeam() {
  return {
    '@type': 'Organization',
    '@id': editorialTeamId,
    name: 'Tutorservices Editorial Team',
    description: 'The Tutorservices team prepares education guidance from common parent and student enquiries and reviews it for service accuracy.',
    url: `${siteUrl}/about`,
    parentOrganization: { '@id': businessId }
  };
}

function createWebsite() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${siteUrl}/`,
    name: 'Tutorservices',
    alternateName: 'Tutorservices.in',
    description: 'Home tuition, online tuition and educational services for students across India.',
    inLanguage: 'en-IN',
    publisher: { '@id': businessId }
  };
}

function createBreadcrumb(config, canonicalUrl) {
  if (config.breadcrumbs.length < 2) return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: config.breadcrumbs.map(([name, urlPath], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${siteUrl}${toCleanPath(urlPath)}`
    }))
  };
}

function extractHomepageFaqs(html) {
  const faqs = [];
  const pattern = /<button[^>]*class="accordion-button[^"]*"[^>]*>([\s\S]*?)<\/button>[\s\S]*?<div class="accordion-body">([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    faqs.push({ question: cleanText(match[1]), answer: cleanText(match[2]) });
  }
  return faqs;
}

function extractArticleFaqs(html) {
  const heading = html.match(/<h2[^>]*>\s*Frequently asked questions\s*<\/h2>/i);
  if (!heading) return [];

  const start = heading.index + heading[0].length;
  const remaining = html.slice(start);
  const boundaries = [remaining.search(/<aside\s+class="related-guides"/i), remaining.search(/<h2[^>]*>\s*Conclusion\s*<\/h2>/i)]
    .filter((index) => index >= 0);
  const end = boundaries.length ? Math.min(...boundaries) : remaining.length;
  const faqSection = remaining.slice(0, end);
  const faqs = [];
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pattern.exec(faqSection))) {
    faqs.push({
      question: cleanText(match[1]).replace(/^\d+\.\s*/, ''),
      answer: cleanText(match[2])
    });
  }
  return faqs;
}

function extractGeneratedFaqs(html) {
  const section = html.match(/<section\s+class="ai-faq"[\s\S]*?<\/section>/i)?.[0];
  if (!section) return [];

  const faqs = [];
  const pattern = /<article>\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<\/article>/gi;
  let match;
  while ((match = pattern.exec(section))) {
    faqs.push({ question: cleanText(match[1]), answer: cleanText(match[2]) });
  }
  return faqs;
}

function deduplicateFaqs(faqs) {
  const seen = new Set();
  return faqs.filter((faq) => {
    const key = faq.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createFaqSchema(faqs, canonicalUrl) {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    url: `${canonicalUrl}#faq`,
    isPartOf: { '@id': `${canonicalUrl}#webpage` },
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

function extractReviews(html) {
  const reviews = [];
  const pattern = /<blockquote\s+class="testimonial">\s*"([\s\S]*?)"\s*<cite>\s*-\s*([\s\S]*?)<\/cite>\s*<\/blockquote>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const index = reviews.length + 1;
    reviews.push({
      '@type': 'Review',
      '@id': `${siteUrl}/#review-${index}`,
      itemReviewed: { '@id': businessId },
      author: {
        '@type': 'Person',
        name: cleanText(match[2])
      },
      reviewBody: cleanText(match[1])
    });
  }
  return reviews;
}

function createArticle(fileName, html, canonicalUrl, title, description, imageUrl, config) {
  const headline = extractRequired(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 'H1', fileName);
  return {
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline,
    name: title,
    description,
    image: imageUrl ? [imageUrl] : [`${siteUrl}/assets/tutor-services-logo.webp`],
    datePublished: config.datePublished,
    dateModified: contentReviewDate,
    inLanguage: 'en-IN',
    author: { '@id': editorialTeamId },
    publisher: { '@id': businessId },
    mainEntityOfPage: { '@id': `${canonicalUrl}#webpage` },
    isPartOf: { '@id': `${siteUrl}/blog#blog` }
  };
}

function createSchemaGraph(fileName, html, config) {
  const canonicalUrl = extractRequired(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'canonical URL', fileName);
  const title = extractRequired(html, /<title>([\s\S]*?)<\/title>/i, 'title', fileName);
  const description = extractMetaContent(html, 'description');
  const imageUrl = extractMetaContent(html, 'og:image', 'property');
  const reviews = fileName === 'index.html' ? extractReviews(html) : [];
  const breadcrumb = createBreadcrumb(config, canonicalUrl);
  const faqs = deduplicateFaqs([
    ...(fileName === 'index.html' ? extractHomepageFaqs(html) : extractArticleFaqs(html)),
    ...extractGeneratedFaqs(html)
  ]);
  const faqSchema = createFaqSchema(faqs, canonicalUrl);
  const graph = [createBusiness(reviews), createWebsite(), createFounder()];

  const page = {
    '@type': config.pageType,
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': websiteId },
    about: { '@id': businessId }
  };

  if (imageUrl) page.primaryImageOfPage = { '@type': 'ImageObject', url: imageUrl };
  if (breadcrumb) page.breadcrumb = { '@id': breadcrumb['@id'] };

  if (config.isArticle) {
    page.mainEntity = { '@id': `${canonicalUrl}#article` };
    page.hasPart = faqSchema ? [{ '@id': faqSchema['@id'] }] : undefined;
  } else if (faqSchema) {
    page.hasPart = [{ '@id': faqSchema['@id'] }];
  }

  graph.push(page);
  if (breadcrumb) graph.push(breadcrumb);

  if (config.isBlog) {
    const blog = {
      '@type': 'Blog',
      '@id': `${canonicalUrl}#blog`,
      url: canonicalUrl,
      name: title,
      description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': websiteId },
      publisher: { '@id': businessId },
      blogPost: articleFiles.map((articleFile) => ({
        '@id': `${siteUrl}${toCleanPath(articleFile)}#article`
      }))
    };
    page.mainEntity = { '@id': blog['@id'] };
    graph.push(blog);
  }

  if (config.isArticle) {
    graph.push(createEditorialTeam());
    graph.push(createArticle(fileName, html, canonicalUrl, title, description, imageUrl, config));
  }

  if (fileName === 'services.html' || config.serviceType) {
    const serviceTypes = config.serviceType || ['Home Tuition', 'Online Tuition', 'Offline Tuition', 'Academic Coaching', 'Spoken English', 'Computer Courses'];
    const service = {
      '@type': 'Service',
      '@id': `${canonicalUrl}#service`,
      name: config.serviceType ? `Tutorservices ${config.serviceType}` : 'Tutorservices Tuition and Learning Services',
      description,
      serviceType: serviceTypes,
      provider: { '@id': businessId },
      areaServed: { '@type': 'Country', name: 'India' }
    };
    page.mainEntity = { '@id': service['@id'] };
    graph.push(service);
  }

  if (faqSchema) graph.push(faqSchema);
  graph.push(...reviews);

  return { '@context': 'https://schema.org', '@graph': graph };
}

function replaceStructuredData(fileName, schema) {
  const filePath = path.join(projectRoot, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  const json = JSON.stringify(schema, null, 2)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
  const schemaTag = `\n  <script type="application/ld+json">\n${json}\n  </script>\n`;
  html = html.replace(/\s*<\/head>/i, `${schemaTag}</head>`);
  fs.writeFileSync(filePath, html, 'utf8');
}

for (const [fileName, config] of Object.entries(pageConfig)) {
  const filePath = path.join(projectRoot, fileName);
  const html = fs.readFileSync(filePath, 'utf8');
  const schema = createSchemaGraph(fileName, html, config);
  replaceStructuredData(fileName, schema);
}

console.log(`Generated standards-based JSON-LD for ${Object.keys(pageConfig).length} pages.`);
