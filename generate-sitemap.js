const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const mainPages = [
  'index.html',
  'about.html',
  'services.html',
  'home-tuition.html',
  'online-tuition.html',
  'courses.html',
  'classes.html',
  'exam-preparation.html',
  'student-registration.html',
  'tutor-registration.html',
  'contact.html',
  'locations.html',
  'blog.html'
];

function getCanonicalUrl(fileName) {
  const html = fs.readFileSync(path.join(projectRoot, fileName), 'utf8');
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);

  if (!match) {
    throw new Error(`Missing canonical URL in ${fileName}`);
  }

  return match[1];
}

function getPageSettings(fileName) {
  if (fileName === 'index.html') return { changefreq: 'weekly', priority: '1.0' };
  if (fileName === 'blog.html') return { changefreq: 'weekly', priority: '0.9' };
  if (['home-tuition.html', 'online-tuition.html', 'courses.html', 'classes.html', 'exam-preparation.html', 'locations.html'].includes(fileName)) return { changefreq: 'monthly', priority: '0.9' };
  if (fileName.includes('registration')) return { changefreq: 'monthly', priority: '0.8' };
  if (mainPages.includes(fileName)) return { changefreq: 'monthly', priority: '0.8' };
  return { changefreq: 'monthly', priority: '0.8' };
}

const htmlFiles = fs.readdirSync(projectRoot)
  .filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName))
  .sort((first, second) => {
    const firstIndex = mainPages.indexOf(first);
    const secondIndex = mainPages.indexOf(second);
    if (firstIndex !== -1 || secondIndex !== -1) {
      if (firstIndex === -1) return 1;
      if (secondIndex === -1) return -1;
      return firstIndex - secondIndex;
    }
    return first.localeCompare(second);
  });

const entries = htmlFiles.map((fileName) => {
  const canonicalUrl = getCanonicalUrl(fileName);
  const modifiedDate = fs.statSync(path.join(projectRoot, fileName)).mtime.toISOString().slice(0, 10);
  const { changefreq, priority } = getPageSettings(fileName);
  return `  <url>\n    <loc>${canonicalUrl}</loc>\n    <lastmod>${modifiedDate}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(projectRoot, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
