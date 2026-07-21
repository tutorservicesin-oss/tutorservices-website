const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const siteUrl = 'https://www.tutorservices.in';
const excludedFiles = new Set(['google4e98645dcf787467.html']);

const htmlFiles = fs.readdirSync(projectRoot)
  .filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName));

const routeMap = Object.fromEntries(htmlFiles.map((fileName) => [
  fileName,
  fileName === 'index.html' ? '/' : `/${path.basename(fileName, '.html').toLowerCase()}`
]));

function removeTrackingParameters(value) {
  const isAbsolute = /^https?:\/\//i.test(value);
  const isRootRelative = value.startsWith('/');
  if (!isAbsolute && !isRootRelative) return value;

  try {
    const parsed = new URL(value, siteUrl);
    if (parsed.origin !== siteUrl) return value;

    [...parsed.searchParams.keys()].forEach((key) => {
      if (/^(?:utm_.+|gclid|fbclid|msclkid|ref)$/i.test(key)) parsed.searchParams.delete(key);
    });

    return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
}

for (const fileName of htmlFiles) {
  const filePath = path.join(projectRoot, fileName);
  let html = fs.readFileSync(filePath, 'utf8');

  for (const [legacyFile, cleanRoute] of Object.entries(routeMap)) {
    const escapedFile = legacyFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const absolutePattern = new RegExp(`${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?${escapedFile}`, 'gi');
    const rootPattern = new RegExp(`/${escapedFile}`, 'gi');
    const relativeAttributePattern = new RegExp(`((?:href|action)=["'])${escapedFile}(["'#?])`, 'gi');

    html = html.replace(absolutePattern, `${siteUrl}${cleanRoute}`);
    html = html.replace(rootPattern, cleanRoute);
    html = html.replace(relativeAttributePattern, `$1${cleanRoute}$2`);
  }

  html = html.replace(/((?:href|action)=["'])([^"']+)(["'])/gi, (match, start, value, end) => {
    return `${start}${removeTrackingParameters(value)}${end}`;
  });

  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Rewrote ${htmlFiles.length} pages to lowercase, extensionless internal URLs.`);
