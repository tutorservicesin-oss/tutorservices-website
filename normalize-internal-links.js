const fs = require('fs');
const path = require('path');

const root = __dirname;
const skip = new Set(['.git', 'vendor']);

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(absolute));
    else if (entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

let changed = 0;
let replacements = 0;
for (const file of collectHtml(root)) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original.replace(/https:\/\/www\.tutorservices\.in\/(index\.html|[a-z0-9/_-]+\.html)(?=([#?"'\s<]|$))/gi, (match, route) => {
    replacements += 1;
    if (route.toLowerCase() === 'index.html') return 'https://www.tutorservices.in/';
    return `https://www.tutorservices.in/${route.slice(0, -5)}`;
  });
  updated = updated.replace(/((?:href|action)=["'])(\/?[a-z0-9/_-]+)\.html([#?][^"']*)?(["'])/gi, (match, prefix, route, suffix = '', quote) => {
    replacements += 1;
    return `${prefix}${route}${suffix}${quote}`;
  });
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed += 1;
  }
}

console.log(`Normalized ${replacements} legacy internal references across ${changed} HTML files.`);
