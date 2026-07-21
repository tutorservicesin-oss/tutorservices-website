const fs = require('fs');
const path = require('path');

const root = __dirname;
const excludedFiles = new Set(['google4e98645dcf787467.html']);
const articleFiles = new Set([
  'benefits-of-home-tuition.html',
  'best-home-tuition-services-india.html',
  'online-learning-tips.html',
  'class-10-board-exam-preparation.html',
  'spoken-english-guide.html'
]);

function businessTrustSection() {
  return `<!-- Business trust signals -->
    <section class="business-trust" aria-labelledby="business-trust-title">
      <div class="container">
        <h2 id="business-trust-title" class="visually-hidden">Tutorservices business information</h2>
        <div class="business-trust-grid">
          <div><i class="fa-solid fa-user-shield" aria-hidden="true"></i><span><strong>Founder-led service</strong>Meenakshi Sharma</span></div>
          <a href="tel:+917011090796"><i class="fa-solid fa-phone" aria-hidden="true"></i><span><strong>Call for enquiries</strong>+91 7011090796</span></a>
          <a href="mailto:tutorservices.in@gmail.com"><i class="fa-solid fa-envelope" aria-hidden="true"></i><span><strong>Email support</strong>tutorservices.in@gmail.com</span></a>
          <div><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span><strong>Service area</strong>New Delhi and online across India</span></div>
        </div>
        <p class="business-trust-note"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Tutor qualifications, subject fit, teaching mode and availability are reviewed for each relevant enquiry before regular classes are confirmed.</p>
      </div>
    </section>
    <!-- /Business trust signals -->`;
}

function authorBox() {
  return `<!-- Article author information -->
      <aside class="article-author" aria-label="Article author and review information">
        <div class="article-author-icon"><i class="fa-solid fa-pen-nib" aria-hidden="true"></i></div>
        <div><span class="section-kicker">Written by</span><h2>Tutorservices Editorial Team</h2><p>Prepared from common parent and student enquiries and reviewed for service accuracy by Meenakshi Sharma, Founder of Tutorservices.</p><div class="article-author-meta"><time datetime="2026-07-21">Last reviewed: 21 July 2026</time><a href="/about">About Tutorservices</a></div></div>
      </aside>
      <!-- /Article author information -->`;
}

function tutorProfiles() {
  const cards = [
    ['fa-book-open-reader', 'Academic foundations profile', 'Primary and middle-school learning support', ['Class-range experience', 'Board familiarity', 'Core subject strength', 'Home or online availability']],
    ['fa-graduation-cap', 'Board and senior-secondary profile', 'Focused support for Classes 9 to 12', ['Subject specialisation', 'Board-question familiarity', 'Written-answer guidance', 'Exam-planning approach']],
    ['fa-laptop-code', 'Language and skills profile', 'Spoken English, computers and coding support', ['Practical demonstration', 'Learner-level fit', 'Relevant course experience', 'Digital teaching ability']]
  ];
  const profileCards = cards.map(([icon, title, description, indicators]) => `<article class="tutor-profile-card"><div class="tutor-profile-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></div><span class="expertise-label">Tutor capability profile</span><h3>${title}</h3><p>${description}</p><ul>${indicators.map((indicator) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i>${indicator}</li>`).join('')}</ul></article>`).join('');
  return `<!-- Tutor expertise profiles -->
    <section class="tutor-profiles section-padding" aria-labelledby="tutor-profiles-title"><div class="container"><div class="section-title"><span class="section-kicker">Expertise Indicators</span><h2 id="tutor-profiles-title">Tutor capability profiles used during matching</h2><p>Profiles are assessed against the learner’s class, board, subject, goals, mode and location. Specific tutor names, qualifications and availability are shared only for relevant enquiries.</p></div><div class="tutor-profile-grid">${profileCards}</div><div class="profile-disclosure"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p><strong>Transparent matching:</strong> These are capability categories, not fictional individual tutor endorsements. Families should review the proposed tutor’s actual qualifications, experience and demo-class fit before confirming tuition.</p></div></div></section>
    <!-- /Tutor expertise profiles -->`;
}

const htmlFiles = fs.readdirSync(root).filter((fileName) => fileName.endsWith('.html') && !excludedFiles.has(fileName));

for (const fileName of htmlFiles) {
  const filePath = path.join(root, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<!-- Business trust signals -->[\s\S]*?<!-- \/Business trust signals -->/gi, '');
  html = html.replace(/\s*<!-- Article author information -->[\s\S]*?<!-- \/Article author information -->/gi, '');
  html = html.replace(/\s*<!-- Tutor expertise profiles -->[\s\S]*?<!-- \/Tutor expertise profiles -->/gi, '');

  if (articleFiles.has(fileName)) {
    html = html.replace(/(<article\s+class="article-content container">)/i, `$1\n      ${authorBox()}`);
  }

  if (fileName === 'services.html') {
    const clusterMarker = '<!-- Cluster architecture -->';
    html = html.replace(clusterMarker, `${tutorProfiles()}\n    ${clusterMarker}`);
  }

  const trustMarker = '<!-- Cluster architecture -->';
  if (!html.includes(trustMarker)) throw new Error(`Missing trust insertion marker in ${fileName}`);
  html = html.replace(trustMarker, `${businessTrustSection()}\n    ${trustMarker}`);
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Generated visible trust signals for ${htmlFiles.length} pages and author details for ${articleFiles.size} articles.`);
