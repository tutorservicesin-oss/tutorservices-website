const fs = require('fs');
const path = require('path');
const { clusters, pageCluster } = require('./topic-cluster-data');

const root = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const overviewPages = new Set(['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html', 'tutor-registration.html']);

function cleanUrl(fileName) {
  return fileName === 'index.html' ? '/' : `/${path.basename(fileName, '.html').toLowerCase()}`;
}

function pillarCard(clusterKey) {
  const cluster = clusters[clusterKey];
  return `<a class="cluster-card" href="${cleanUrl(cluster.pillarFile)}"><strong>${cluster.label}</strong><span>${cluster.description}</span></a>`;
}

function renderOverview() {
  return `<section class="cluster-architecture section-padding" aria-labelledby="cluster-overview-title"><div class="container"><div class="section-title"><span class="section-kicker">Learning Directory</span><h2 id="cluster-overview-title">Explore tuition by learning need</h2><p>Start with a learning mode, subject, class, exam or service area, then follow the most relevant guidance.</p></div><div class="cluster-overview-grid">${Object.keys(clusters).map(pillarCard).join('')}</div></div></section>`;
}

function renderClusterPage(fileName, clusterKey) {
  const cluster = clusters[clusterKey];
  const memberLinks = cluster.members
    .filter(([memberFile]) => memberFile !== fileName)
    .map(([memberFile, label, description]) => `<a href="${cleanUrl(memberFile)}"><strong>${label}</strong><span>${description}</span></a>`)
    .join('');
  const secondaryClusters = Object.entries(clusters)
    .filter(([key, candidate]) => key !== clusterKey && candidate.members.some(([memberFile]) => memberFile === fileName))
    .map(([key]) => key);
  const relatedKeys = [...new Set([...cluster.related, ...secondaryClusters])];
  const relatedLinks = relatedKeys.map((relatedKey) => pillarCard(relatedKey)).join('');
  const pillarLink = fileName === cluster.pillarFile ? '' : `<p class="cluster-backlink">Start with the <a href="${cleanUrl(cluster.pillarFile)}">${cluster.label} guide</a> for the complete overview.</p>`;

  return `<section class="cluster-architecture section-padding" aria-labelledby="cluster-${clusterKey}-title"><div class="container"><div class="section-title"><span class="section-kicker">${cluster.label} Hub</span><h2 id="cluster-${clusterKey}-title">Related ${cluster.label.toLowerCase()} resources</h2><p>${cluster.description}</p>${pillarLink}</div><div class="cluster-member-links">${memberLinks}</div><div class="cluster-related"><h3>Explore connected topics</h3><div class="cluster-overview-grid">${relatedLinks}</div></div></div></section>`;
}

const htmlFiles = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName));

for (const fileName of htmlFiles) {
  const filePath = path.join(root, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<!-- Cluster architecture -->[\s\S]*?<!-- \/Cluster architecture -->/gi, '');
  const clusterKey = pageCluster[fileName];
  const content = overviewPages.has(fileName) || !clusterKey ? renderOverview() : renderClusterPage(fileName, clusterKey);
  const marker = '<!-- AI-ready answer guide -->';
  const insertionPoint = html.indexOf(marker);
  if (insertionPoint < 0) throw new Error(`Missing AI guide marker in ${fileName}`);
  html = `${html.slice(0, insertionPoint)}<!-- Cluster architecture -->\n${content}\n<!-- /Cluster architecture -->\n    ${html.slice(insertionPoint)}`;
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Generated scalable cluster navigation for ${htmlFiles.length} pages.`);
