const fs = require('fs');
const path = require('path');

const root = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const articles = new Set(['benefits-of-home-tuition.html', 'best-home-tuition-services-india.html', 'online-learning-tips.html', 'class-10-board-exam-preparation.html', 'spoken-english-guide.html']);
const files = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName));
const errors = [];
let reviewCount = 0;

for (const fileName of files) {
  const html = fs.readFileSync(path.join(root, fileName), 'utf8');
  if (!html.includes('<!-- Business trust signals -->')) errors.push(`${fileName}: missing visible business trust section`);
  if (!html.includes('+91 7011090796')) errors.push(`${fileName}: missing visible telephone`);
  if (!html.includes('tutorservices.in@gmail.com')) errors.push(`${fileName}: missing visible email`);

  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!schemaMatch) {
    errors.push(`${fileName}: missing JSON-LD`);
    continue;
  }
  const schema = JSON.parse(schemaMatch[1]);
  const graph = schema['@graph'] || [];
  const business = graph.find((item) => Array.isArray(item['@type']) && item['@type'].includes('Organization'));
  const founder = graph.find((item) => item['@id'] === 'https://www.tutorservices.in/#founder');
  if (!business?.telephone || !business?.email || !business?.address) errors.push(`${fileName}: incomplete Organization business details`);
  if (!founder || founder.jobTitle !== 'Founder') errors.push(`${fileName}: missing founder Person schema`);

  if (articles.has(fileName)) {
    const article = graph.find((item) => item['@type'] === 'Article');
    const editorialTeam = graph.find((item) => item['@id'] === 'https://www.tutorservices.in/#editorial-team');
    if (!html.includes('<!-- Article author information -->') || !html.includes('datetime="2026-07-21"')) errors.push(`${fileName}: missing visible author or reviewed date`);
    if (!article?.author || article.dateModified !== '2026-07-21T00:00:00+05:30' || !editorialTeam) errors.push(`${fileName}: incomplete Article author schema`);
  }

  reviewCount += graph.filter((item) => item['@type'] === 'Review' && item.itemReviewed?.['@id'] === 'https://www.tutorservices.in/#business').length;
}

const servicesHtml = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
const profileCount = (servicesHtml.match(/class="tutor-profile-card"/g) || []).length;
if (profileCount !== 3 || !servicesHtml.includes('These are capability categories, not fictional individual tutor endorsements')) errors.push('services.html: tutor capability profiles or disclosure missing');
if (reviewCount < 1) errors.push('No Review schema found for visible testimonials');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Trust validation passed: ${files.length} business panels, ${articles.size} attributed articles, ${profileCount} tutor capability profiles and ${reviewCount} Review schema entries.`);
