const fs = require('fs');
const path = require('path');
const { clusters } = require('./topic-cluster-data');

const root = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
function findHtmlFiles(directory, relativeDirectory = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(absolutePath, relativePath);
    if (!entry.name.endsWith('.html') || excludedFiles.has(entry.name)) return [];
    return [relativePath.replaceAll('\\', '/')];
  });
}

const files = findHtmlFiles(root);

function cleanUrl(fileName) {
  return fileName === 'index.html' ? '/' : `/${fileName.replace(/\.html$/i, '').toLowerCase()}`;
}

function extractLinks(html) {
  return [...html.matchAll(/href="(\/[^"#?]*)/gi)].map((match) => match[1] || '/');
}

const graph = new Map(files.map((fileName) => [cleanUrl(fileName), extractLinks(fs.readFileSync(path.join(root, fileName), 'utf8'))]));
const errors = [];

for (const cluster of Object.values(clusters)) {
  const pillarUrl = cleanUrl(cluster.pillarFile);
  const pillarLinks = graph.get(pillarUrl) || [];
  if (!graph.has(pillarUrl)) errors.push(`Missing pillar: ${pillarUrl}`);
  for (const [memberFile] of cluster.members) {
    const memberUrl = cleanUrl(memberFile);
    if (!graph.has(memberUrl)) errors.push(`Missing cluster member: ${memberUrl}`);
    if (!pillarLinks.includes(memberUrl)) errors.push(`${pillarUrl} does not link to ${memberUrl}`);
    if (!(graph.get(memberUrl) || []).includes(pillarUrl)) errors.push(`${memberUrl} does not link back to ${pillarUrl}`);
  }
}

const depths = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const current = queue.shift();
  for (const linkedUrl of graph.get(current) || []) {
    if (graph.has(linkedUrl) && !depths.has(linkedUrl)) {
      depths.set(linkedUrl, depths.get(current) + 1);
      queue.push(linkedUrl);
    }
  }
}

for (const url of graph.keys()) if (!depths.has(url)) errors.push(`Orphan page: ${url}`);
const maxDepth = Math.max(...depths.values());
if (maxDepth > 2) errors.push(`Maximum crawl depth is ${maxDepth}; expected 2 or less.`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Topic clusters valid: ${Object.keys(clusters).length} hubs, ${files.length} pages, zero orphans, maximum crawl depth ${maxDepth}.`);
