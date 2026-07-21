const fs = require('fs');
const path = require('path');

const root = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const pages = fs.readdirSync(root)
  .filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName))
  .sort();
const errors = [];
let visibleFaqCount = 0;
let schemaFaqCount = 0;

for (const fileName of pages) {
  const html = fs.readFileSync(path.join(root, fileName), 'utf8');
  const checks = [
    ['one AI answer guide', (html.match(/class="ai-answer-section\b/g) || []).length === 1],
    ['one concise definition', (html.match(/<strong>Definition:<\/strong>/g) || []).length === 1],
    ['one summary box', (html.match(/class="ai-summary-box"/g) || []).length === 1],
    ['one key-takeaway list', (html.match(/class="ai-takeaways"/g) || []).length === 1],
    ['one ordered step guide', (html.match(/class="ai-steps"/g) || []).length === 1],
    ['one semantic comparison table', (html.match(/class="ai-comparison"/g) || []).length === 1],
    ['exactly one H1', (html.match(/<h1\b/gi) || []).length === 1]
  ];

  checks.forEach(([label, passed]) => {
    if (!passed) errors.push(`${fileName}: failed ${label}`);
  });

  const generatedFaqs = (html.match(/<section\s+class="ai-faq"[\s\S]*?<\/section>/i)?.[0].match(/<article>/g) || []).length;
  const accordionFaqs = (html.match(/class="accordion-button/g) || []).length;
  const articleFaqSection = /<h2[^>]*>\s*Frequently asked questions\s*<\/h2>/i.test(html) ? 1 : 0;
  const pageVisibleFaqs = generatedFaqs || accordionFaqs || articleFaqSection;
  if (!pageVisibleFaqs) errors.push(`${fileName}: missing visible FAQ content`);
  visibleFaqCount += pageVisibleFaqs;

  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (jsonLdBlocks.length !== 1) errors.push(`${fileName}: expected one JSON-LD block`);

  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block[1]);
      const graph = data['@graph'] || [];
      const faqSchema = graph.find((item) => item['@type'] === 'FAQPage');
      if (!faqSchema?.mainEntity?.length) errors.push(`${fileName}: missing FAQPage questions`);
      else schemaFaqCount += faqSchema.mainEntity.length;
    } catch (error) {
      errors.push(`${fileName}: invalid JSON-LD (${error.message})`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`AI content validation passed for ${pages.length} pages.`);
console.log(`Visible FAQ coverage: ${pages.length}/${pages.length} pages.`);
console.log(`FAQPage structured questions: ${schemaFaqCount}.`);
