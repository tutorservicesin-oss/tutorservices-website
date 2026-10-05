const fs = require('fs');

const rows = [];
const seen = new Set();

function add(cluster, keyword, intent, route, pageType = 'Existing page') {
  const clean = keyword.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!clean || seen.has(clean)) return;
  seen.add(clean);
  rows.push({ cluster, keyword: clean, intent, route, pageType });
}

const serviceGroups = [
  ['Core tutoring', ['tutoring services', 'tutor service', 'find a tutor', 'tuition teacher'], '/services'],
  ['Home tuition', ['home tuition', 'tuition at home', 'home tuition service', 'personal home tuition'], '/home-tuition'],
  ['Home tutors', ['home tutor', 'home tuition teacher', 'tutor at home', 'home teacher'], '/home-tuition'],
  ['Private tutors', ['private tutor', 'personal tutor', 'private tuition teacher', 'individual tutor'], '/one-to-one-tuition'],
  ['Online tuition', ['online tuition', 'online tutor', 'live online classes', 'virtual tuition'], '/online-tuition'],
  ['Offline tuition', ['offline tuition', 'local tuition classes', 'in-person tuition', 'face-to-face tuition'], '/offline-tuition'],
  ['Tutors near me', ['tutor near me', 'home tutor near me', 'private tutor near me', 'tuition teacher near me'], '/tutors-near-me'],
  ['Tuition near me', ['tuition near me', 'home tuition near me', 'private tuition near me', 'local tuition near me'], '/tutors-near-me'],
  ['Affordable tuition', ['affordable home tuition', 'affordable private tutor', 'budget-friendly tuition', 'reasonable home tutor fees'], '/home-tuition-fees'],
  ['One-to-one tuition', ['one-to-one tuition', 'one-on-one tutor', 'individual tuition classes', 'personalised tuition'], '/one-to-one-tuition'],
  ['Experienced tutors', ['experienced tutor', 'qualified home tutor', 'subject expert tutor', 'experienced private teacher'], '/how-we-verify-tutors'],
  ['Flexible tutoring', ['flexible tuition timings', 'weekend tuition classes', 'evening home tuition', 'tuition with flexible schedule'], '/services'],
  ['Tutor matching', ['tutor matching service', 'find the right tutor', 'personalised tutor matching', 'tutor selection help'], '/student-registration'],
];

const serviceModifiers = [
  ['', 'Commercial'], [' for school students', 'Commercial'], [' for better grades', 'Commercial'],
  [' for exam preparation', 'Commercial'], [' for homework support', 'Commercial'],
  [' with flexible timings', 'Commercial'], [' with demo class', 'Commercial'],
  [' for personalised learning', 'Commercial'], [' for concept clarity', 'Commercial'],
  [' for regular revision', 'Commercial'], [' for weak students', 'Commercial'],
  [' for confident learning', 'Commercial'],
];

for (const [cluster, seeds, route] of serviceGroups) {
  for (const seed of seeds) for (const [modifier, intent] of serviceModifiers) add(cluster, `${seed}${modifier}`, intent, route);
}

const subjects = [
  ['Mathematics', 'maths', '/subjects/mathematics-tuition'], ['Science', 'science', '/subjects/science-tuition'],
  ['Physics', 'physics', '/subjects/physics-tuition'], ['Chemistry', 'chemistry', '/subjects/chemistry-tuition'],
  ['Biology', 'biology', '/subjects/biology-tuition'], ['English', 'english', '/subjects/english-tuition'],
  ['Hindi', 'hindi', '/subjects/hindi-tuition'], ['Social Science', 'social science', '/subjects/social-science-tuition'],
  ['Computer Science', 'computer science', '/subjects/computer-science-tuition'], ['Coding', 'coding', '/subjects/coding-for-kids'],
  ['Accountancy', 'accountancy', '/subjects/accountancy-tuition'], ['Economics', 'economics', '/subjects/economics-tuition'],
  ['Business Studies', 'business studies', '/subjects/business-studies-tuition'],
];

const subjectTemplates = [
  ['{s} tutor', 'Commercial'], ['{s} tutor near me', 'Local commercial'], ['online {s} tutor', 'Commercial'],
  ['home tutor for {s}', 'Commercial'], ['private {s} tutor', 'Commercial'], ['{s} tuition classes', 'Commercial'],
  ['one-to-one {s} tuition', 'Commercial'], ['{s} tuition for school students', 'Commercial'],
  ['{s} tutor for concept clarity', 'Commercial'], ['{s} exam preparation tutor', 'Commercial'],
  ['best {s} tutor for students', 'Commercial'], ['affordable {s} tuition', 'Commercial'],
];

for (const [cluster, subject, route] of subjects) {
  for (const [template, intent] of subjectTemplates) add(`${cluster} tuition`, template.replace('{s}', subject), intent, route);
}

const classes = [
  ['Primary school', 'class 1', '/classes/class-1-to-5-tuition'], ['Primary school', 'class 2', '/classes/class-1-to-5-tuition'],
  ['Primary school', 'class 3', '/classes/class-1-to-5-tuition'], ['Primary school', 'class 4', '/classes/class-1-to-5-tuition'],
  ['Primary school', 'class 5', '/classes/class-1-to-5-tuition'], ['Middle school', 'class 6', '/classes/class-6-to-8-tuition'],
  ['Middle school', 'class 7', '/classes/class-6-to-8-tuition'], ['Middle school', 'class 8', '/classes/class-6-to-8-tuition'],
  ['Secondary school', 'class 9', '/classes/class-9-tuition'], ['Secondary school', 'class 10', '/classes/class-10-tuition'],
  ['Senior secondary', 'class 11', '/classes/class-11-tuition'], ['Senior secondary', 'class 12', '/classes/class-12-tuition'],
];

const classTemplates = [
  ['home tuition for {c}', 'Commercial'], ['home tutor for {c}', 'Commercial'], ['online tuition for {c}', 'Commercial'],
  ['private tutor for {c}', 'Commercial'], ['{c} tutor near me', 'Local commercial'], ['one-to-one tuition for {c}', 'Commercial'],
  ['{c} maths tutor', 'Commercial'], ['{c} science tutor', 'Commercial'], ['{c} english tutor', 'Commercial'],
  ['best tutor for {c}', 'Commercial'], ['affordable tuition for {c}', 'Commercial'], ['exam preparation for {c}', 'Informational'],
];
for (const [cluster, className, route] of classes) {
  for (const [template, intent] of classTemplates) add(cluster, template.replace('{c}', className), intent, route);
}

const boards = [
  ['CBSE', 'cbse', '/boards/cbse-tuition'], ['ICSE', 'icse', '/boards/icse-tuition'],
  ['State boards', 'state board', '/boards/state-board-tuition'], ['IGCSE', 'igcse', '/boards'],
  ['IB', 'ib board', '/boards'], ['NIOS', 'nios', '/boards'],
];
const boardTemplates = [
  ['{b} home tutor', 'Commercial'], ['{b} home tutor near me', 'Local commercial'], ['{b} online tuition', 'Commercial'],
  ['{b} private tutor', 'Commercial'], ['{b} tuition for class 10', 'Commercial'], ['{b} tuition for class 12', 'Commercial'],
  ['{b} maths tutor', 'Commercial'], ['{b} science tutor', 'Commercial'], ['{b} english tutor', 'Commercial'],
  ['{b} board exam preparation', 'Informational'], ['best tutor for {b} students', 'Commercial'],
  ['one-to-one tuition for {b}', 'Commercial'],
];
for (const [cluster, board, route] of boards) {
  for (const [template, intent] of boardTemplates) add(`${cluster} tuition`, template.replace('{b}', board), intent, route);
}

const exams = [
  ['JEE', 'jee', '/competitive-exams/jee-foundation'], ['NEET', 'neet', '/competitive-exams/neet-foundation'],
  ['CUET', 'cuet', '/competitive-exams/cuet-preparation'], ['Olympiad preparation', 'olympiad', '/competitive-exams/olympiad-preparation'],
  ['Board exam preparation', 'class 10 board exam', '/boards/class-10-board-tuition'],
  ['Board exam preparation', 'class 12 board exam', '/boards/class-12-board-tuition'],
];
const examTemplates = [
  ['{e} tutor', 'Commercial'], ['{e} tutor near me', 'Local commercial'], ['online {e} preparation', 'Commercial'],
  ['home tuition for {e}', 'Commercial'], ['private tutor for {e}', 'Commercial'], ['{e} foundation classes', 'Commercial'],
  ['one-to-one {e} coaching', 'Commercial'], ['{e} study plan', 'Informational'], ['{e} revision strategy', 'Informational'],
  ['best tutor for {e}', 'Commercial'], ['{e} preparation for school students', 'Commercial'], ['{e} mock test support', 'Commercial'],
];
for (const [cluster, exam, route] of exams) {
  for (const [template, intent] of examTemplates) add(cluster, template.replace('{e}', exam), intent, route);
}

const locations = [
  ['Delhi', 'delhi', '/cities/delhi'], ['South Delhi', 'south delhi', '/cities/delhi/south-delhi-home-tuition'],
  ['Dwarka', 'dwarka', '/cities/delhi/dwarka-home-tuition'], ['Rohini', 'rohini', '/cities/delhi/rohini-home-tuition'],
  ['Connaught Place', 'connaught place', '/cities/delhi/connaught-place-home-tuition'],
  ['Gurugram', 'gurugram', '/cities/gurugram'], ['Noida', 'noida', '/cities/noida'],
  ['Ghaziabad', 'ghaziabad', '/cities/ghaziabad'], ['Faridabad', 'faridabad', '/cities/faridabad'],
];
const locationTemplates = [
  ['home tuition in {l}', 'Local commercial'], ['home tutor in {l}', 'Local commercial'],
  ['private tutor in {l}', 'Local commercial'], ['tutor near me in {l}', 'Local commercial'],
  ['online tuition in {l}', 'Local commercial'], ['one-to-one tuition in {l}', 'Local commercial'],
  ['maths tutor in {l}', 'Local commercial'], ['science tutor in {l}', 'Local commercial'],
  ['cbse tutor in {l}', 'Local commercial'], ['class 10 tutor in {l}', 'Local commercial'],
  ['verified tutors in {l}', 'Local commercial'], ['home tuition fees in {l}', 'Local informational'],
];
for (const [cluster, location, route] of locations) {
  for (const [template, intent] of locationTemplates) add(`${cluster} location`, template.replace('{l}', location), intent, route);
}

const guidance = [
  ['Parent and student questions', 'how to choose a home tutor', '/best-home-tuition-services-india'],
  ['Parent and student questions', 'questions to ask before hiring a tutor', '/questions-parents-should-ask-before-hiring-tutor'],
  ['Parent and student questions', 'how to check tutor qualifications', '/how-we-verify-tutors'],
  ['Tuition comparison', 'home tuition vs online tuition', '/online-tuition-vs-home-tuition'],
  ['Tuition comparison', 'one-to-one tuition vs group tuition', '/one-to-one-vs-group-tuition'],
  ['Tuition comparison', 'academic coaching vs tuition', '/academic-coaching-vs-tuition-parent-guide'],
  ['Tutor fees', 'how are home tuition fees decided', '/home-tuition-fees'],
  ['Tutor fees', 'expected tuition fees before starting classes', '/expected-tuition-fees-before-starting-classes'],
  ['Demo classes', 'what happens in a tuition demo class', '/demo-class-for-tuition-tutor-fit-guide'],
  ['Progress tracking', 'how parents can track tuition progress', '/how-parents-track-tuition-progress'],
  ['Study support', 'tuition for weak students', '/home-tuition-for-weak-students'],
  ['Study support', 'homework support tuition', '/homework-support-tuition-study-discipline'],
];
const questionPrefixes = ['', 'parents guide to ', 'student guide to ', 'tips for ', 'best way to understand ', 'what to know about '];
for (const [cluster, phrase, route] of guidance) {
  for (const prefix of questionPrefixes) add(cluster, `${prefix}${phrase}`, 'Informational', route);
}

const skills = [
  ['Spoken English', 'spoken english classes', '/languages/spoken-english-classes'],
  ['Languages', 'english grammar classes', '/languages/english-grammar-classes'],
  ['Skill-based tutoring', 'coding classes for kids', '/subjects/coding-for-kids'],
  ['Skill-based tutoring', 'computer classes for students', '/computer-courses'],
  ['Skill-based tutoring', 'communication skills classes', '/languages'],
];
for (const [cluster, seed, route] of skills) {
  for (const suffix of ['', ' near me', ' online', ' for beginners', ' with personal tutor', ' with flexible timings', ' for school students', ' one-to-one', ' at home', ' for confidence']) {
    add(cluster, `${seed}${suffix}`, suffix.includes('near me') ? 'Local commercial' : 'Commercial', route);
  }
}

const genderNeeds = [
  ['Female tutors', 'female home tutor', '/student-registration'], ['Male tutors', 'male home tutor', '/student-registration'],
];
for (const [cluster, seed, route] of genderNeeds) {
  for (const suffix of ['', ' near me', ' for school students', ' for maths', ' for science', ' for class 10', ' for class 12', ' with flexible timings']) {
    add(cluster, `${seed}${suffix}`, 'Commercial preference-based', route);
  }
}

if (rows.length < 1000 || rows.length > 1500) throw new Error(`Keyword universe must contain 1000-1500 unique rows; generated ${rows.length}.`);

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const csv = ['keyword,cluster,search_intent,target_route,page_decision'];
for (const row of rows) csv.push([row.keyword, row.cluster, row.intent, row.route, row.pageType].map(csvEscape).join(','));
fs.writeFileSync('seo-keyword-universe.csv', `${csv.join('\n')}\n`);

const clusterMap = new Map();
for (const row of rows) {
  if (!clusterMap.has(row.cluster)) clusterMap.set(row.cluster, { route: row.route, keywords: [], intents: new Set() });
  const item = clusterMap.get(row.cluster);
  item.keywords.push(row.keyword);
  item.intents.add(row.intent);
}
const mapCsv = ['cluster,primary_keyword,secondary_keywords,search_intent,recommended_page,recommended_title,recommended_h1,supporting_questions,internal_links,related_pages'];
for (const [cluster, item] of [...clusterMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const primary = item.keywords[0];
  const secondary = item.keywords.slice(1, 7).join(' | ');
  const title = `${primary.replace(/\b\w/g, (m) => m.toUpperCase())} | TutorServices`;
  const h1 = primary.replace(/\b\w/g, (m) => m.toUpperCase());
  const questions = `How does ${primary} work? | What should parents check? | How are tutors matched?`;
  mapCsv.push([cluster, primary, secondary, [...item.intents].join(' | '), item.route, title, h1, questions, '/services | /student-registration | /contact', '/subjects | /classes | /boards | /cities'].map(csvEscape).join(','));
}
fs.writeFileSync('seo-content-cluster-map.csv', `${mapCsv.join('\n')}\n`);

const locationCsv = [
  'location,current_route,decision,reason',
  'Delhi,/cities/delhi,Keep and strengthen,Primary supported home-tuition market with locality pages',
  'South Delhi,/cities/delhi/south-delhi-home-tuition,Keep,Dedicated useful locality coverage',
  'Dwarka,/cities/delhi/dwarka-home-tuition,Keep,Dedicated sector-based locality coverage',
  'Rohini,/cities/delhi/rohini-home-tuition,Keep,Dedicated sector-based locality coverage',
  'Connaught Place,/cities/delhi/connaught-place-home-tuition,Keep,Central Delhi intent with nearby-area context',
  'Gurugram,/cities/gurugram,Keep,Supported NCR city hub with local guidance',
  'Noida,/cities/noida,Keep,Supported NCR city hub with sector guidance',
  'Ghaziabad,/cities/ghaziabad,Keep,Supported NCR city hub subject to tutor availability',
  'Faridabad,/cities/faridabad,Keep,Supported NCR city hub subject to tutor availability',
  'Additional Indian cities,,Do not create yet,Use nationwide online tuition page until genuine service evidence and unique local information exist',
];
fs.writeFileSync('seo-location-opportunity-map.csv', `${locationCsv.join('\n')}\n`);

console.log(`Generated ${rows.length} unique keywords across ${clusterMap.size} clusters.`);
