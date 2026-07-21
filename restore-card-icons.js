const fs = require('fs');
const path = require('path');

const root = __dirname;
const fontAwesome = '<link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css">';
const htmlFiles = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html'));

function addFontAwesome(content) {
  const cleaned = content
    .replace(/\s*<link[^>]+cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[^>]+>/gi, '')
    .replace(/\s*<link[^>]+vendor\/fontawesome\/css\/all\.min\.css[^>]+>/gi, '');
  const versioned = cleaned.replace(/href="style\.min\.css(?:\?v=[^"]+)?"/gi, 'href="style.min.css?v=20260721-icons2"');
  return versioned.replace(/(<link rel="stylesheet" href="style\.min\.css\?v=20260721-icons2">)/i, `$1\n  ${fontAwesome}`);
}

for (const fileName of htmlFiles) {
  const filePath = path.join(root, fileName);
  fs.writeFileSync(filePath, addFontAwesome(fs.readFileSync(filePath, 'utf8')), 'utf8');
}

for (const styleName of ['style.css', 'style.min.css']) {
  const stylePath = path.join(root, styleName);
  const css = fs.readFileSync(stylePath, 'utf8');
  const restoredCss = css.replace(/i\[class\*=(?:"|')?fa-(?:"|')?\]\s*\{[\s\S]*?\.fa-youtube::?before\s*\{[^}]*\}/i, '');
  fs.writeFileSync(stylePath, restoredCss, 'utf8');
}

const generatorPath = path.join(root, 'generate-pillar-pages.js');
fs.writeFileSync(generatorPath, addFontAwesome(fs.readFileSync(generatorPath, 'utf8')), 'utf8');

console.log(`Restored local Font Awesome icons on ${htmlFiles.length} pages and removed fallback glyph overrides.`);
