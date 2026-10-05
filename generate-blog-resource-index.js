const fs = require('fs');
const path = require('path');

const root = __dirname;
const blogFile = path.join(root, 'blog.html');
const startMarker = '          <!-- Comprehensive Guide Directory: generated -->';
const endMarker = '          <!-- /Comprehensive Guide Directory: generated -->';

const groups = [
  {
    title: 'Choosing and working with a tutor',
    description: 'Practical guidance for comparing tutors, setting expectations and reviewing progress.',
    routes: [
      'academic-coaching-vs-tuition-parent-guide', 'choose-tuition-mode-home-online-group',
      'demo-class-for-tuition-tutor-fit-guide', 'expected-tuition-fees-before-starting-classes',
      'flexible-tuition-timings-for-students', 'how-parents-track-tuition-progress',
      'how-to-compare-home-tutors-parent-guide',
      'questions-parents-should-ask-before-hiring-tutor', 'regular-tuition-assessments-improve-learning',
      'tuition-progress-reports-parent-guide', 'tutor-verification-process-parent-confidence-guide'
    ]
  },
  {
    title: 'Home, online and group tuition',
    description: 'Compare learning formats and plan tuition around each student’s confidence, routine and goals.',
    routes: [
      'cbse-board-exam-home-tuition-guide', 'cbse-home-tuition-class-1-to-12',
      'home-tuition-for-class-6-to-8-students', 'home-tuition-for-weak-students',
      'home-tuition-vs-offline-coaching-parent-guide', 'home-tutor-near-me-local-matching-guide',
      'homework-support-tuition-study-discipline', 'one-to-one-tuition-for-doubt-solving',
      'online-tuition-across-india-board-exam-students', 'online-tuition-setup-checklist',
      'online-tuition-support-for-parents', 'private-tutor-for-better-study-habits',
      'private-tutor-for-primary-students-guide', 'small-group-tuition-benefits-guide'
    ]
  },
  {
    title: 'Classes, boards and exam preparation',
    description: 'Class-wise and board-focused planning for school learning, revision and entrance foundations.',
    routes: [
      'cbse-vs-icse-tuition', 'class-10-board-exam-revision-strategy',
      'class-10-tuition-school-revision-tests-guide', 'class-11-tuition-senior-secondary-adjustment-guide',
      'class-12-science-tuition-planning-guide', 'class-12-tuition-board-entrance-balance',
      'class-9-maths-and-science-tuition-guide', 'cuet-preparation-class-12-planning-guide',
      'icse-tuition-guide-english-science-mathematics', 'jee-foundation-classes-class-9-and-10-guide',
      'middle-school-tuition-classes-6-7-8-guide', 'neet-foundation-preparation-school-students',
      'olympiad-preparation-for-school-students-parent-guide', 'state-board-tuition-parent-guide'
    ]
  },
  {
    title: 'Subjects and study skills',
    description: 'Subject-specific learning plans plus revision and study-routine guidance for students.',
    routes: [
      'biology-tuition-diagrams-terms-ncert-revision', 'chemistry-tuition-organic-inorganic-physical-plan',
      'coding-for-kids-parent-starting-guide', 'computer-science-tuition-for-school-students',
      'english-grammar-classes-practical-learning-plan', 'english-grammar-practice-for-school-students',
      'english-tuition-reading-writing-grammar-confidence', 'how-to-choose-class-10-maths-tutor',
      'how-to-know-child-needs-extra-academic-support', 'maths-tuition-for-students-who-fear-numbers',
      'physics-tuition-for-numericals-and-concepts', 'revision-planning-for-students-before-exams',
      'science-tuition-class-9-and-10', 'science-tuition-for-concept-clarity',
      'spoken-english-classes-for-students-and-beginners', 'study-timetable-for-school-students',
      'tips-before-hiring-home-tutor'
    ]
  },
  {
    title: 'Delhi NCR local tuition guides',
    description: 'Local parent guides for established TutorServices coverage areas, subject to tutor availability.',
    routes: [
      'home-tuition-connaught-place-central-delhi-guide', 'home-tuition-dwarka-family-guide',
      'home-tuition-in-delhi-parent-checklist', 'home-tuition-rohini-parent-checklist',
      'home-tuition-south-delhi-parent-guide'
    ]
  }
];

function pageHeading(route) {
  const file = path.join(root, `${route}.html`);
  if (!fs.existsSync(file)) throw new Error(`Missing guide page: ${route}.html`);
  const html = fs.readFileSync(file, 'utf8');
  return html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim() || route.replace(/-/g, ' ');
}

const cards = groups.map((group) => {
  const links = group.routes.map((route) => `                    <li><a href="/${route}">${pageHeading(route)}</a></li>`).join('\n');
  return `            <div class="col-lg-6">
              <article class="feature-card h-100">
                <h3>${group.title}</h3>
                <p>${group.description}</p>
                <ul class="mb-0">
${links}
                </ul>
              </article>
            </div>`;
}).join('\n');

const section = `${startMarker}
          <section class="section-padding" aria-labelledby="complete-guide-directory">
            <div class="container">
              <div class="text-center mb-5">
                <span class="section-kicker">Complete Learning Library</span>
                <h2 id="complete-guide-directory">Browse all tuition and study guides</h2>
                <p class="mx-auto" style="max-width: 760px;">Explore practical resources by learning format, class, board, subject and service area. Each guide answers a distinct parent or student question.</p>
              </div>
              <div class="row g-4">
${cards}
              </div>
            </div>
          </section>
${endMarker}`;

let blog = fs.readFileSync(blogFile, 'utf8');
const existing = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
if (existing.test(blog)) blog = blog.replace(existing, section);
else blog = blog.replace('    <!-- Search-friendly topic cluster -->', `${section}\n\n    <!-- Search-friendly topic cluster -->`);
fs.writeFileSync(blogFile, blog, 'utf8');
console.log(`Added ${groups.reduce((total, group) => total + group.routes.length, 0)} guide links to blog.html.`);
