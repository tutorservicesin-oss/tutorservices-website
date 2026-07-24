const fs = require('fs');
const path = require('path');

const root = __dirname;
const stylePath = path.join(root, 'style.css');
const layoutPath = path.join(root, 'layout.css');

const tokens = `:root {
  --primary: #00E5FF;
  --secondary: #7B2FF7;
  --accent: #FF0080;
  --cta: #FF6B00;
  --background: #050816;
  --background-secondary: #0B1228;
  --surface: #101A35;
  --text-primary: #FFFFFF;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --border: rgba(255,255,255,0.12);
  --divider: rgba(255,255,255,0.08);
  --hover-bg: rgba(0,229,255,0.08);
  --focus-ring: #00E5FF;
  --link: #00E5FF;
  --link-hover: #22D3EE;
  --success: #22C55E;
  --warning: #FACC15;
  --error: #EF4444;
  --blue: var(--background);
  --blue-2: var(--background-secondary);
  --green: var(--primary);
  --green-dark: var(--link-hover);
  --yellow: var(--accent);
  --cream: var(--background-secondary);
  --white: var(--surface);
  --ink: var(--text-primary);
  --muted: var(--text-secondary);
  --line: var(--border);
  --navy: var(--background);
  --body-bg: var(--background);
  --shadow: 0 22px 60px rgba(0, 229, 255, 0.12);
  --shadow-sm: 0 10px 30px rgba(0, 229, 255, 0.08);
  --radius: 8px;
}`;

let style = fs.readFileSync(stylePath, 'utf8');
style = style.replace(/:root\s*\{[\s\S]*?\n\}/, tokens);
style = style.replace(/body\.dark-mode\s*\{[\s\S]*?\n\}/, `body.dark-mode {
  --background: #0B1228;
  --background-secondary: #050816;
  --surface: #101A35;
  --ink: var(--text-primary);
  --muted: var(--text-secondary);
  --line: var(--border);
  background: var(--background);
}`);

const colorReplacements = [
  [/#0B2447/gi, '#050816'], [/#123B70/gi, '#0B1228'], [/#14213D/gi, '#FFFFFF'],
  [/#64748B/gi, '#94A3B8'], [/#B6C2D2/gi, '#CBD5E1'], [/#FFF8E7/gi, '#0B1228'],
  [/#2ECC71/gi, '#00E5FF'], [/#F1C40F/gi, '#FF0080'], [/#17A65A/gi, '#7B2FF7'],
  [/#25D366/gi, '#22C55E'], [/#dc3545/gi, '#EF4444'], [/#07182F/gi, '#050816'],
  [/#0D2442/gi, '#0B1228'], [/#06162C/gi, '#050816'], [/#102f55/gi, '#101A35'],
  [/#163d70/gi, '#0B1228'],
  [/rgba\(11,\s*36,\s*71,\s*\.06\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(11,\s*36,\s*71,\s*0\.06\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(11,\s*36,\s*71,\s*0\.07\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(11,\s*36,\s*71,\s*0\.08\)/gi, 'rgba(255,255,255,.08)'],
  [/rgba\(11,\s*36,\s*71,\s*0\.1\)/gi, 'rgba(255,255,255,.12)'],
  [/rgba\(11,\s*36,\s*71,\s*(?:0\.)?12\)/gi, 'rgba(255,255,255,.12)'],
  [/rgba\(11,\s*36,\s*71,\s*(?:0\.)?13\)/gi, 'rgba(0,229,255,.12)'],
  [/rgba\(46,\s*204,\s*113,\s*\.12\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(46,\s*204,\s*113,\s*\.13\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(46,\s*204,\s*113,\s*\.14\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(46,\s*204,\s*113,\s*\.18\)/gi, 'rgba(0,229,255,.18)'],
  [/rgba\(46,\s*204,\s*113,\s*\.25\)/gi, 'rgba(255,107,0,.28)'],
  [/rgba\(46,\s*204,\s*113,\s*\.45\)/gi, 'rgba(0,229,255,.55)'],
  [/rgba\(46,\s*204,\s*113,\s*0\.08\)/gi, 'rgba(0,229,255,.08)'],
  [/rgba\(241,\s*196,\s*15,\s*0\.08\)/gi, 'rgba(255,0,128,.08)'],
  [/rgba\(6,\s*22,\s*44,\s*\.66\)/gi, 'rgba(5,8,22,.82)'],
  [/rgba\(6,\s*22,\s*44,\s*\.72\)/gi, 'rgba(5,8,22,.88)'],
  [/rgba\(7,\s*24,\s*47,\s*0\.88\)/gi, 'rgba(11,18,40,.94)'],
  [/rgba\(11,36,71,\.94\)/gi, 'rgba(5,8,22,.94)'],
  [/rgba\(11,36,71,\.95\)/gi, 'rgba(5,8,22,.95)'],
  [/rgba\(11,36,71,\.96\)/gi, 'rgba(5,8,22,.96)'],
  [/rgba\(11,36,71,\.72\)/gi, 'rgba(11,18,40,.78)'],
  [/rgba\(11,36,71,\.76\)/gi, 'rgba(11,18,40,.82)'],
  [/rgba\(11,36,71,\.78\)/gi, 'rgba(203,213,225,.86)'],
  [/rgba\(11,36,71,\.42\)/gi, 'rgba(123,47,247,.36)'],
  [/rgba\(11,36,71,\.22\)/gi, 'rgba(0,229,255,.12)'],
  [/rgba\(18,59,112,\.92\)/gi, 'rgba(123,47,247,.88)']
];

for (const [pattern, replacement] of colorReplacements) style = style.replace(pattern, replacement);

const declarationReplacements = [
  ['background: var(--white);\n  overflow-x: hidden;', 'background: var(--background);\n  overflow-x: hidden;'],
  ['a { color: inherit;', 'a { color: inherit;'],
  ['background: rgba(255, 255, 255, 0.88);', 'background: rgba(11, 18, 40, 0.92);'],
  ['.navbar-toggler-icon::before { content: "â˜°"; color: var(--blue);', '.navbar-toggler-icon::before { content: "â˜°"; color: var(--primary);'],
  ['.navbar-brand { display: flex; align-items: center; gap: .65rem; color: var(--blue);', '.navbar-brand { display: flex; align-items: center; gap: .65rem; color: var(--text-primary);'],
  ['.nav-link { color: var(--blue);', '.nav-link { color: var(--text-secondary);'],
  ['background: var(--white); color: var(--blue);', 'background: var(--surface); color: var(--primary);'],
  ['.btn-brand { background: var(--green); color: var(--blue); border: 0;', '.btn-brand { background: var(--cta); color: var(--text-primary); border: 0;'],
  ['.btn-brand:hover { background: var(--yellow); color: var(--blue);', '.btn-brand:hover { background: var(--accent); color: var(--text-primary);'],
  ['.btn-outline-brand { border: 2px solid var(--green); color: var(--blue);', '.btn-outline-brand { border: 2px solid var(--primary); color: var(--primary);'],
  ['.btn-outline-brand:hover { background: var(--green); color: var(--blue);', '.btn-outline-brand:hover { background: var(--primary); color: var(--background);'],
  ['.counter { font-family: "Montserrat", sans-serif; font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 800; color: var(--blue);', '.counter { font-family: "Montserrat", sans-serif; font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 800; color: var(--primary);'],
  ['background: linear-gradient(135deg, var(--cream), #fff);', 'background: linear-gradient(135deg, var(--background-secondary), var(--background));'],
  ['.cta-panel.green { background: linear-gradient(135deg, #7B2FF7, var(--green)); color: var(--blue);', '.cta-panel.green { background: linear-gradient(135deg, var(--secondary), var(--accent)); color: var(--text-primary);'],
  ['.cta-panel.green p { color: rgba(203,213,225,.86);', '.cta-panel.green p { color: var(--text-secondary);'],
  ['.accordion-button:not(.collapsed) { background: rgba(0,229,255,.08); color: var(--blue);', '.accordion-button:not(.collapsed) { background: var(--hover-bg); color: var(--primary);'],
  ['box-shadow: 0 0 0 .2rem rgba(0,229,255,.18);', 'box-shadow: 0 0 0 .2rem rgba(0,229,255,.22);'],
  ['.filter-btn.active, .filter-btn:hover { background: var(--green); color: var(--blue);', '.filter-btn.active, .filter-btn:hover { background: var(--primary); color: var(--background);'],
  ['.newsletter-form button { border: 0; border-radius: var(--radius); background: var(--green); color: var(--blue);', '.newsletter-form button { border: 0; border-radius: var(--radius); background: var(--cta); color: var(--text-primary);'],
  ['.call-now { right: 1rem; bottom: 4.8rem; background: var(--yellow); color: var(--blue);', '.call-now { right: 1rem; bottom: 4.8rem; background: var(--cta); color: var(--text-primary);'],
  ['.inquiry-tab { border: 0; border-radius: var(--radius); background: var(--green); color: var(--blue);', '.inquiry-tab { border: 0; border-radius: var(--radius); background: var(--cta); color: var(--text-primary);'],
  ['.chat-toggle { position: static; background: var(--blue); color: var(--white);', '.chat-toggle { position: static; background: var(--secondary); color: var(--text-primary);'],
  ['background: linear-gradient(135deg, var(--navy), #0B1228);', 'background: linear-gradient(135deg, var(--background), var(--secondary));'],
  ['color: var(--navy);', 'color: var(--primary);'],
  ['background: var(--navy);', 'background: var(--background-secondary);'],
  ['color: var(--blue);\n  transition:', 'color: var(--primary);\n  transition:'],
  ['.ai-steps li::marker { color: var(--blue);', '.ai-steps li::marker { color: var(--secondary);'],
  ['.ai-comparison tbody th { color: var(--blue);', '.ai-comparison tbody th { color: var(--primary);']
];

for (const [find, replacement] of declarationReplacements) style = style.replaceAll(find, replacement);
style = style
  .replace('--muted: var(--text-secondary);', '--muted: var(--text-muted);')
  .replaceAll('color: var(--white)', 'color: var(--text-primary)')
  .replaceAll('background-color: var(--text-primary)', 'background-color: var(--surface)')
  .replace('.navbar-toggler-icon::before { content: "☰"; color: var(--blue);', '.navbar-toggler-icon::before { content: "☰"; color: var(--primary);')
  .replaceAll('rgba(11, 36, 71, .12)', 'rgba(255,255,255,.12)');

let layout = fs.readFileSync(layoutPath, 'utf8');
layout = layout
  .replace('.navbar-toggler{padding:.25rem .75rem;font-size:1.25rem;line-height:1;background:transparent;border:1px solid rgba(0,0,0,.15)', '.navbar-toggler{padding:.25rem .75rem;font-size:1.25rem;line-height:1;background:transparent;border:1px solid rgba(255,255,255,.12)')
  .replace('.btn-light{color:#000;background:#f8f9fa;border-color:#f8f9fa}', '.btn-light{color:#fff;background:#101A35;border-color:rgba(255,255,255,.12)}')
  .replaceAll('#64748b', '#94A3B8')
  .replaceAll('background:#e9ecef', 'background:#0B1228')
  .replaceAll('border-color:#dc3545', 'border-color:#EF4444')
  .replaceAll('rgba(11,36,71,.12)', 'rgba(255,255,255,.12)')
  .replaceAll('border:1px solid rgba(0,0,0,.18)', 'border:1px solid rgba(255,255,255,.12)')
  .replaceAll('.btn-close{box-sizing:content-box;width:1em;height:1em;padding:.25em;color:#000', '.btn-close{box-sizing:content-box;width:1em;height:1em;padding:.25em;color:#fff')
  .replaceAll('box-shadow:0 .5rem 1rem rgba(0,0,0,.15)', 'box-shadow:0 .5rem 1rem rgba(0,229,255,.12)');

fs.writeFileSync(stylePath, style, 'utf8');
fs.writeFileSync(layoutPath, layout, 'utf8');

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

fs.writeFileSync(path.join(root, 'style.min.css'), minify(style), 'utf8');
fs.writeFileSync(path.join(root, 'layout.min.css'), minify(layout), 'utf8');

for (const fileName of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const filePath = path.join(root, fileName);
  const html = fs.readFileSync(filePath, 'utf8')
    .replace(/style\.min\.css(?:\?v=[^"']+)?/g, 'style.min.css?v=20260721-neon3')
    .replace(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}">/g, '<meta name="theme-color" content="#050816">');
  fs.writeFileSync(filePath, html, 'utf8');
}

const pillarGeneratorPath = path.join(root, 'generate-pillar-pages.js');
const pillarGenerator = fs.readFileSync(pillarGeneratorPath, 'utf8')
  .replace(/style\.min\.css(?:\?v=[^"']+)?/g, 'style.min.css?v=20260721-neon3')
  .replace(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}">/g, '<meta name="theme-color" content="#050816">');
fs.writeFileSync(pillarGeneratorPath, pillarGenerator, 'utf8');

console.log('Applied the cyber-neon palette through existing theme tokens and rebuilt minified CSS.');
