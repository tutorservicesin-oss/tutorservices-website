const fs = require('fs');
const path = require('path');

const root = __dirname;
const siteOrigin = 'https://www.tutorservices.in';
const ignoredDirectories = new Set(['.git', 'vendor']);
const ignoredHtml = new Set(['google4e98645dcf787467.html', 'how-to-find-home-tutor-near-me-safely.html', 'online-tuition-across-india-student-guide.html']);

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(absolute));
    else if (entry.name.endsWith('.html') && !ignoredHtml.has(entry.name)) files.push(absolute);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(root, file).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  return `/${relative.slice(0, -5)}`;
}

function matchOne(html, expression, valueGroup = 1) {
  return html.match(expression)?.[valueGroup]?.trim() ?? '';
}

const files = collectHtml(root).sort();
const routeToFile = new Map(files.map((file) => [routeFor(file), file]));
const errors = [];
const warnings = [];
const canonicalOwners = new Map();
const titleOwners = new Map();
const descriptionOwners = new Map();
const inboundLinks = new Map(files.map((file) => [routeFor(file), 0]));
const internalGraph = new Map(files.map((file) => [routeFor(file), new Set()]));
let linksChecked = 0;
let schemaBlocks = 0;

for (const file of files) {
  const relative = path.relative(root, file).replace(/\\/g, '/');
  const route = routeFor(file);
  const html = fs.readFileSync(file, 'utf8');
  const title = matchOne(html, /<title>([^<]+)<\/title>/i);
  const description = matchOne(html, /<meta\s+name=["']description["']\s+content=(["'])(.*?)\1/i, 2);
  const canonical = matchOne(html, /<link\s+rel=["']canonical["']\s+href=(["'])(.*?)\1/i, 2);
  const robots = matchOne(html, /<meta\s+name=["']robots["']\s+content=(["'])(.*?)\1/i, 2);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`${relative}: missing title`);
  else {
    if (title.length > 68) warnings.push(`${relative}: title is ${title.length} characters`);
    if (titleOwners.has(title)) warnings.push(`${relative}: duplicate title also used by ${titleOwners.get(title)}`);
    titleOwners.set(title, relative);
  }
  if (!description) errors.push(`${relative}: missing meta description`);
  else {
    if (description.length < 90 || description.length > 180) warnings.push(`${relative}: meta description is ${description.length} characters`);
    if (descriptionOwners.has(description)) warnings.push(`${relative}: duplicate meta description also used by ${descriptionOwners.get(description)}`);
    descriptionOwners.set(description, relative);
  }
  if (h1Count !== 1) errors.push(`${relative}: expected one H1, found ${h1Count}`);
  if (!canonical) errors.push(`${relative}: missing canonical`);
  else {
    const expected = `${siteOrigin}${route}`;
    if (canonical !== expected) errors.push(`${relative}: canonical ${canonical} should be ${expected}`);
    if (canonicalOwners.has(canonical)) errors.push(`${relative}: duplicate canonical also used by ${canonicalOwners.get(canonical)}`);
    canonicalOwners.set(canonical, relative);
  }
  if (!robots || !/index/i.test(robots)) warnings.push(`${relative}: missing explicit index robots directive`);
  if (!/<meta\s+property=["']og:title["']/i.test(html)) warnings.push(`${relative}: missing Open Graph title`);
  if (!/<meta\s+property=["']og:description["']/i.test(html)) warnings.push(`${relative}: missing Open Graph description`);
  if (!/<meta\s+name=["']twitter:card["']/i.test(html)) warnings.push(`${relative}: missing Twitter card metadata`);

  for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attributes = image[1];
    const alt = attributes.match(/\balt=(['"])(.*?)\1/i)?.[2];
    if (alt === undefined) errors.push(`${relative}: image missing alt attribute`);
  }

  for (const block of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    schemaBlocks += 1;
    try { JSON.parse(block[1]); } catch (error) { errors.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }

  for (const link of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const value = link[1].trim();
    if (!value || /^(?:#|mailto:|tel:|sms:|javascript:)/i.test(value)) continue;
    let parsed;
    try { parsed = new URL(value, siteOrigin); } catch { errors.push(`${relative}: invalid link ${value}`); continue; }
    if (parsed.origin !== siteOrigin) continue;
    linksChecked += 1;
    if (/\.html$/i.test(parsed.pathname)) errors.push(`${relative}: legacy .html internal link ${value}`);
    const normalized = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/$/, '') : '/';
    if (!routeToFile.has(normalized) && !normalized.startsWith('/api/')) errors.push(`${relative}: unresolved internal route ${value}`);
    else if (routeToFile.has(normalized)) {
      internalGraph.get(route).add(normalized);
      if (normalized !== route) inboundLinks.set(normalized, inboundLinks.get(normalized) + 1);
    }
  }
}

const orphanRoutes = [...inboundLinks.entries()]
  .filter(([route, count]) => route !== '/' && count === 0)
  .map(([route]) => route);
for (const route of orphanRoutes) warnings.push(`${route}: no inbound HTML links`);

const crawlDepth = new Map([['/', 0]]);
const crawlQueue = ['/'];
while (crawlQueue.length) {
  const current = crawlQueue.shift();
  for (const linkedRoute of internalGraph.get(current) || []) {
    if (!crawlDepth.has(linkedRoute)) {
      crawlDepth.set(linkedRoute, crawlDepth.get(current) + 1);
      crawlQueue.push(linkedRoute);
    }
  }
}
const maximumCrawlDepth = Math.max(...crawlDepth.values());
if (crawlDepth.size !== files.length) errors.push(`crawl graph reaches ${crawlDepth.size} of ${files.length} pages`);
if (maximumCrawlDepth > 2) {
  const deepRoutes = [...crawlDepth.entries()].filter(([, depth]) => depth > 2).map(([route]) => route);
  warnings.push(`maximum crawl depth is ${maximumCrawlDepth}: ${deepRoutes.join(', ')}`);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()));
for (const canonical of canonicalOwners.keys()) if (!sitemapUrls.has(canonical)) errors.push(`sitemap.xml: missing ${canonical}`);
for (const url of sitemapUrls) if (!canonicalOwners.has(url)) errors.push(`sitemap.xml: non-canonical or missing page ${url}`);

const robotsText = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!/User-agent:\s*\*/i.test(robotsText)) errors.push('robots.txt: missing wildcard user-agent');
if (!/Allow:\s*\//i.test(robotsText)) errors.push('robots.txt: missing Allow: /');
if (!/Sitemap:\s*https:\/\/www\.tutorservices\.in\/sitemap\.xml/i.test(robotsText)) errors.push('robots.txt: missing canonical sitemap reference');

const report = [
  '# Comprehensive SEO QA Report', '', `Generated: ${new Date().toISOString().slice(0, 10)}`, '',
  '## Coverage', '', `- HTML pages: ${files.length}`, `- Internal links checked: ${linksChecked}`,
  `- Canonical URLs: ${canonicalOwners.size}`, `- JSON-LD blocks parsed: ${schemaBlocks}`,
  `- Orphan pages: ${orphanRoutes.length}`,
  `- Maximum crawl depth: ${maximumCrawlDepth}`,
  `- Errors: ${errors.length}`, `- Warnings: ${warnings.length}`, '',
  '## Errors', '', ...(errors.length ? errors.map((item) => `- ${item}`) : ['- None']), '',
  '## Warnings', '', ...(warnings.length ? warnings.map((item) => `- ${item}`) : ['- None']), '',
  '## Safety checks', '', '- robots.txt remains crawlable.', '- Sitemap entries are compared with canonical URLs.',
  '- Nested routes are included in internal-link validation.', '- JSON-LD is parsed but not expanded with unsupported claims.', '',
];
fs.writeFileSync(path.join(root, 'comprehensive-seo-qa-report.md'), report.join('\n'), 'utf8');

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} errors. See comprehensive-seo-qa-report.md.`);
  process.exit(1);
}
console.log(`SEO audit passed for ${files.length} pages and ${linksChecked} internal links with ${warnings.length} warnings.`);
