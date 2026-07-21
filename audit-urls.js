const fs = require('fs');
const path = require('path');

const root = __dirname;
const siteUrl = 'https://www.tutorservices.in';
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const htmlFiles = fs.readdirSync(root)
  .filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName))
  .sort();

const routeMap = Object.fromEntries(htmlFiles.map((fileName) => [
  fileName,
  fileName === 'index.html' ? '/' : `/${path.basename(fileName, '.html').toLowerCase()}`
]));
const validRoutes = new Set(Object.values(routeMap));
const errors = [];
const canonicals = new Map();
let internalLinkCount = 0;

function extractRequired(html, pattern, label, fileName) {
  const match = html.match(pattern);
  if (!match) {
    errors.push(`${fileName}: missing ${label}`);
    return '';
  }
  return match[1];
}

for (const fileName of htmlFiles) {
  const html = fs.readFileSync(path.join(root, fileName), 'utf8');
  const expectedRoute = routeMap[fileName];
  const expectedCanonical = `${siteUrl}${expectedRoute}`;
  const canonical = extractRequired(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'canonical', fileName);
  const openGraphUrl = extractRequired(html, /<meta\s+property="og:url"\s+content="([^"]+)"/i, 'Open Graph URL', fileName);

  if (canonical !== expectedCanonical) errors.push(`${fileName}: canonical should be ${expectedCanonical}, found ${canonical}`);
  if (openGraphUrl !== expectedCanonical) errors.push(`${fileName}: og:url should match canonical`);
  if (canonicals.has(canonical)) errors.push(`${fileName}: duplicate canonical also used by ${canonicals.get(canonical)}`);
  canonicals.set(canonical, fileName);

  const staleHtmlUrls = html.match(/https:\/\/www\.tutorservices\.in\/[^"]*\.html|(?:href|action)=["'][^"']*\.html/gi) || [];
  staleHtmlUrls.forEach((url) => errors.push(`${fileName}: stale HTML URL ${url}`));

  for (const match of html.matchAll(/<(?:a|form)\b[^>]*(?:href|action)=["']([^"']+)["']/gi)) {
    const value = match[1];
    if (/^(?:mailto:|tel:|sms:|#)/i.test(value)) continue;

    let parsed;
    try {
      parsed = new URL(value, siteUrl);
    } catch {
      errors.push(`${fileName}: invalid URL ${value}`);
      continue;
    }

    if (parsed.origin !== siteUrl) continue;
    internalLinkCount += 1;

    if (parsed.pathname !== parsed.pathname.toLowerCase()) errors.push(`${fileName}: uppercase internal path ${value}`);
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) errors.push(`${fileName}: trailing-slash duplicate ${value}`);
    if (/\.html$/i.test(parsed.pathname)) errors.push(`${fileName}: legacy extension in ${value}`);
    if ([...parsed.searchParams.keys()].some((key) => /^(?:utm_.+|gclid|fbclid|msclkid|ref)$/i.test(key))) {
      errors.push(`${fileName}: unnecessary tracking parameter in ${value}`);
    }
    if (!validRoutes.has(parsed.pathname)) errors.push(`${fileName}: unresolved internal route ${value}`);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const canonicalUrls = [...canonicals.keys()];
if (JSON.stringify([...sitemapUrls].sort()) !== JSON.stringify([...canonicalUrls].sort())) {
  errors.push('sitemap.xml URLs do not exactly match page canonicals');
}

const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (vercelConfig.cleanUrls !== true) errors.push('vercel.json must enable cleanUrls');
if (vercelConfig.trailingSlash !== false) errors.push('vercel.json must disable trailingSlash');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const rows = htmlFiles.map((fileName) => {
  const oldUrl = fileName === 'index.html' ? '/index.html' : `/${fileName}`;
  return `| \`${oldUrl}\` | \`${routeMap[fileName]}\` | Vercel 308 |`;
});

const report = `# URL Audit Report

Generated: ${new Date().toISOString().slice(0, 10)}

## Summary

- Public pages audited: ${htmlFiles.length}
- Internal links audited: ${internalLinkCount}
- Unique canonical URLs: ${canonicals.size}
- Broken internal routes: 0
- Duplicate canonicals: 0
- Uppercase canonical or internal paths: 0
- Internal tracking parameters: 0
- Stale public \`.html\` references: 0
- Trailing-slash duplicates: prevented by Vercel

## Redirect Map

\`cleanUrls: true\` permanently redirects legacy \`.html\` requests to extensionless URLs. \`trailingSlash: false\` consolidates slash variants.

| Previous URL | Canonical URL | Redirect |
| --- | --- | --- |
${rows.join('\n')}

## Required External Parameters

Google Fonts family and display parameters and the Google Analytics measurement ID remain because those services require them. No page, canonical, sitemap, or internal navigation URL contains query parameters.
`;

fs.writeFileSync(path.join(root, 'url-audit-report.md'), report, 'utf8');
console.log(`URL audit passed for ${htmlFiles.length} pages and ${internalLinkCount} internal links.`);
