const fs = require('fs');
const path = require('path');

const root = __dirname;
const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'layout.css'), 'utf8');
const requiredTokens = {
  primary: '#00E5FF', secondary: '#7B2FF7', accent: '#FF0080', cta: '#FF6B00',
  background: '#050816', 'background-secondary': '#0B1228', surface: '#101A35',
  'text-primary': '#FFFFFF', 'text-secondary': '#CBD5E1', 'text-muted': '#94A3B8',
  'focus-ring': '#00E5FF', link: '#00E5FF', 'link-hover': '#22D3EE',
  success: '#22C55E', warning: '#FACC15', error: '#EF4444'
};
const legacyColors = ['#0B2447', '#123B70', '#2ECC71', '#F1C40F', '#FFF8E7', '#14213D', '#64748B', '#17A65A', '#25D366', '#07182F', '#0D2442', '#06162C', '#102F55', '#163D70', '#DC3545'];
const errors = [];

for (const [token, value] of Object.entries(requiredTokens)) {
  if (!new RegExp(`--${token}:\\s*${value.replace('#', '\\#')}`, 'i').test(style)) errors.push(`Missing or incorrect --${token}`);
}

for (const color of legacyColors) {
  if (`${style}\n${layout}`.toLowerCase().includes(color.toLowerCase())) errors.push(`Legacy color remains: ${color}`);
}

const pages = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html') && !fileName.startsWith('google'));
for (const fileName of pages) {
  const html = fs.readFileSync(path.join(root, fileName), 'utf8');
  if (!html.includes('style.min.css?v=20260721-neon3')) errors.push(`${fileName}: missing versioned neon stylesheet`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Theme validation passed: ${Object.keys(requiredTokens).length} required tokens, ${pages.length} pages, and zero legacy palette values.`);
