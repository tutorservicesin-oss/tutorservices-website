const fs = require('fs');
const path = require('path');

const root = __dirname;
const htmlFiles = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html'));
const styleFiles = ['style.css', 'style.min.css'];
const generatorFiles = ['generate-pillar-pages.js', 'generate-structured-data.js'];

function removeImageOptimizations(content) {
  return content
    .replace(/\s+loading="(?:lazy|eager)"/gi, '')
    .replace(/\s+decoding="async"/gi, '')
    .replace(/\s+fetchpriority="high"/gi, '');
}

function standardizePage(content) {
  let updated = content
    .replace(/tutor-services-logo\.webp/g, 'tutor-services-logo.png')
    .replace(/\.webp/g, '.jpg')
    .replace(/\b(src|href)="assets\//g, '$1="/assets/')
    .replace(/url\((["']?)assets\//g, 'url($1/assets/');

  updated = updated.replace(/\s*<link\s+rel="preload"\s+as="image"[^>]*>/gi, '');
  return removeImageOptimizations(updated);
}

function standardizeGenerator(content, fileName) {
  let updated = content
    .replace(/tutor-services-logo\.webp/g, 'tutor-services-logo.png')
    .replace(/\.webp/g, '.jpg');

  if (fileName === 'generate-pillar-pages.js') {
    updated = updated
      .replace(/image: 'assets\//g, "image: '/assets/")
      .replace(/src="assets\//g, 'src="/assets/')
      .replace(/href="assets\//g, 'href="/assets/')
      .replace(/\$\{siteUrl\}\/\$\{page\.image\}/g, '${siteUrl}${page.image}');
  }

  return removeImageOptimizations(updated);
}

for (const fileName of [...htmlFiles, ...styleFiles]) {
  const filePath = path.join(root, fileName);
  fs.writeFileSync(filePath, standardizePage(fs.readFileSync(filePath, 'utf8')), 'utf8');
}

for (const fileName of generatorFiles) {
  const filePath = path.join(root, fileName);
  fs.writeFileSync(filePath, standardizeGenerator(fs.readFileSync(filePath, 'utf8'), fileName), 'utf8');
}

console.log(`Restored standard JPEG/PNG references in ${htmlFiles.length} pages, stylesheets and generators.`);
