const fs = require('fs');
const path = require('path');

const root = __dirname;
const siteUrl = 'https://www.tutorservices.in';

const pages = {
  'home-tuition.html': {
    title: 'Home Tuition in India | Personal Home Tutors | Tutorservices',
    description: 'Find home tuition for Class 1 to 12, CBSE, ICSE and State Boards. Request a personal tutor by subject, class, locality and preferred timing.',
    keywords: 'home tuition India, home tutor near me, private tutor, one to one home tuition',
    heading: 'Personalised home tuition for every class and subject.',
    lead: 'Request one-to-one learning support at home based on the student’s board, subjects, locality and schedule.',
    image: '/assets/images/home-tuition-study-guide.jpg',
    imageAlt: 'Student studying with books during a personalised home tuition session',
    introTitle: 'Home tuition built around the learner',
    intro: 'Home tuition gives a tutor direct time with one student or a small group. Families can request support for regular schoolwork, weak subjects, board preparation or a specific academic goal.',
    cards: [['fa-house-user', 'One-to-one attention', 'Lessons can focus on the learner’s questions, pace and weak concepts.'], ['fa-book-open', 'Board-aligned support', 'Specify CBSE, ICSE or State Board requirements when submitting the enquiry.'], ['fa-clock', 'Practical scheduling', 'Match class timings with school, travel and the tutor’s local availability.']],
    audienceTitle: 'Who home tuition can support',
    audiences: [['Primary learners', 'Build reading, writing, numeracy and confident study habits.'], ['Middle-school students', 'Strengthen concepts as subjects become more specialised.'], ['Board-exam students', 'Combine chapter revision, written practice and regular tests.']]
  },
  'online-tuition.html': {
    title: 'Online Tuition in India | Live Online Tutors | Tutorservices',
    description: 'Find online tuition for school subjects, spoken English, coding and exam preparation. Learn from home with flexible tutor matching across India.',
    keywords: 'online tuition India, online tutor, live online classes, online classes for students',
    heading: 'Live online tuition from anywhere in India.',
    lead: 'Connect with tutors beyond your locality for academic subjects, exam support and practical skill classes.',
    image: '/assets/images/online-tuition-learning-guide.jpg',
    imageAlt: 'Student attending an interactive online tuition class on a laptop',
    introTitle: 'Flexible learning without a location limit',
    intro: 'Online tuition uses live video, shared notes and digital practice to connect a learner with a tutor. It is useful when local tutor availability, travel or scheduling makes in-person tuition difficult.',
    cards: [['fa-video', 'Live interaction', 'Students can ask questions, share work and receive explanations during class.'], ['fa-location-dot', 'Nationwide access', 'Tutor matching is not restricted to the student’s neighbourhood or city.'], ['fa-laptop', 'Digital learning tools', 'Lessons can use screen sharing, online whiteboards, notes and practice resources.']],
    audienceTitle: 'When online tuition is useful',
    audiences: [['Students outside major cities', 'Access subject tutors without depending only on local supply.'], ['Busy school students', 'Reduce travel and fit lessons into a practical weekly schedule.'], ['Skill learners', 'Learn spoken English, coding or computers through guided online practice.']]
  },
  'classes.html': {
    title: 'Tuition by Class | Class 1 to 12 Tutors | Tutorservices',
    description: 'Explore tuition support by class from primary school to Class 12 for CBSE, ICSE and State Boards, with home and online tutor options.',
    keywords: 'tuition by class, Class 1 to 12 tutor, primary tuition, Class 10 tutor, Class 12 tutor',
    heading: 'Tuition support from primary school to Class 12.',
    lead: 'Choose tutoring according to the learner’s class, board, subjects, current level and academic goals.',
    image: '/assets/images/students-learning-with-mentor.jpg',
    imageAlt: 'Students from different classes learning with guidance from a mentor',
    introTitle: 'Different classes need different teaching priorities',
    intro: 'Primary learners need strong foundations, middle-school students need concept clarity, and secondary or senior-secondary students need subject depth, written practice and exam planning.',
    cards: [['fa-user-graduate', 'Class 1 to 5', 'Foundational mathematics, languages, environmental studies and study habits.'], ['fa-school', 'Class 6 to 8', 'Concept-building across mathematics, science, social science and languages.'], ['fa-graduation-cap', 'Class 9 to 12', 'Board subjects, streams, written answers, revision and examination strategy.']],
    audienceTitle: 'Learning priorities by stage',
    audiences: [['Primary stage', 'Use simple explanations, repetition and regular foundational practice.'], ['Secondary stage', 'Connect concepts across chapters and improve answer-writing accuracy.'], ['Senior-secondary stage', 'Focus on stream subjects, board patterns and future entrance goals.']]
  },
  'exam-preparation.html': {
    title: 'Exam Preparation Tuition | Board and Competitive Exams | Tutorservices',
    description: 'Find tutoring for school tests, Class 10 and 12 board exams and competitive-exam foundations with revision, practice tests and personalised guidance.',
    keywords: 'exam preparation tuition, board exam tutor, Class 10 coaching, Class 12 tuition, competitive exam foundation',
    heading: 'Structured tuition for school, board and foundation exams.',
    lead: 'Turn the syllabus into a practical plan for concept learning, revision, written practice and timed tests.',
    image: '/assets/images/class-10-board-exam-preparation-guide.jpg',
    imageAlt: 'Student preparing a structured timetable for school board examinations',
    introTitle: 'Exam preparation needs more than extra classes',
    intro: 'Effective exam tuition combines syllabus coverage with revision cycles, practice questions, mock papers and error analysis. The right plan depends on the exam, available time and the learner’s weak areas.',
    cards: [['fa-clipboard-list', 'School examinations', 'Prepare chapters, class tests and term examinations with regular practice.'], ['fa-award', 'Board examinations', 'Use sample papers, written answers, timed work and focused revision.'], ['fa-bullseye', 'Competitive foundations', 'Strengthen concepts, speed and problem-solving before advanced preparation.']],
    audienceTitle: 'Core parts of an exam plan',
    audiences: [['Concept coverage', 'Resolve gaps before relying heavily on memorisation or mock papers.'], ['Revision system', 'Return to chapters at planned intervals to strengthen recall.'], ['Test analysis', 'Record mistakes and repeat weak question types until performance improves.']]
  }
};

function analytics() {
  return `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}function loadTutorservicesAnalytics(){if(window.tutorservicesAnalyticsLoaded)return;window.tutorservicesAnalyticsLoaded=true;const tag=document.createElement("script");tag.async=true;tag.src="https://www.googletagmanager.com/gtag/js?id=G-KNFJRWMJHZ";document.head.appendChild(tag);gtag("js",new Date);gtag("config","G-KNFJRWMJHZ")}["pointerdown","keydown"].forEach(eventName=>window.addEventListener(eventName,loadTutorservicesAnalytics,{once:true,passive:true}));window.addEventListener("load",()=>window.setTimeout(loadTutorservicesAnalytics,1e4),{once:true});</script>`;
}

function navbar() {
  return `<header class="site-header"><nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="/"><img src="/assets/tutor-services-logo.png" alt="Tutorservices home tuition and online tutoring logo" width="128" height="128"><span class="brand-copy">tutorservices<small>Learn Smarter, Achieve Faster</small></span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav ms-auto align-items-lg-center"><li class="nav-item"><a class="nav-link" href="/">Home</a></li><li class="nav-item"><a class="nav-link" href="/home-tuition">Home Tuition</a></li><li class="nav-item"><a class="nav-link" href="/online-tuition">Online Tuition</a></li><li class="nav-item"><a class="nav-link" href="/courses">Subjects</a></li><li class="nav-item"><a class="nav-link" href="/classes">Classes</a></li><li class="nav-item"><a class="btn btn-sm btn-brand ms-lg-3" href="/student-registration">Book Demo</a></li></ul></div></div></nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="row g-4"><div class="col-lg-4"><a class="footer-brand" href="/">tutorservices</a><p>Home, online and exam-focused tutoring support across India.</p></div><div class="col-6 col-lg-2"><h3>Topics</h3><a href="/home-tuition">Home Tuition</a><a href="/online-tuition">Online Tuition</a><a href="/courses">Subjects</a></div><div class="col-6 col-lg-2"><h3>Explore</h3><a href="/classes">Classes</a><a href="/exam-preparation">Exams</a><a href="/locations">Cities</a></div><div class="col-lg-4"><h3>Enquire</h3><a href="/student-registration">Book a Free Demo</a><a href="/tutor-registration">Become a Tutor</a><a href="/contact">Contact</a></div></div><div class="footer-bottom">&copy; 2026 Tutorservices. Learn Smarter, Achieve Faster.</div></div></footer>`;
}

function renderPage(fileName, page) {
  const route = `/${path.basename(fileName, '.html')}`;
  const cards = page.cards.map(([icon, title, description]) => `<div class="col-md-4"><article class="feature-card h-100"><i class="fa-solid ${icon}"></i><h3>${title}</h3><p>${description}</p></article></div>`).join('');
  const audiences = page.audiences.map(([title, description]) => `<div class="col-md-4"><article class="step-card h-100"><h3>${title}</h3><p>${description}</p></article></div>`).join('');
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  ${analytics()}
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}"><meta name="keywords" content="${page.keywords}"><meta name="robots" content="index, follow">
  <link rel="canonical" href="${siteUrl}${route}">
  <meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl}${route}"><meta property="og:site_name" content="Tutorservices"><meta property="og:image" content="${siteUrl}${page.image}"><meta property="og:image:alt" content="${page.imageAlt}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${page.title}"><meta name="twitter:description" content="${page.description}"><meta name="twitter:image" content="${siteUrl}${page.image}"><meta name="twitter:image:alt" content="${page.imageAlt}"><meta name="theme-color" content="#0B2447">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&amp;family=Poppins:wght@400;500;600;700&amp;display=optional" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&amp;family=Poppins:wght@400;500;600;700&amp;display=optional"></noscript>
  <link rel="stylesheet" href="layout.min.css"><link rel="stylesheet" href="style.min.css"><link rel="icon" type="image/png" href="/assets/favicon.png">
</head>
<body>
  ${navbar()}
  <main>
    <section class="page-hero"><div class="container"><span class="eyebrow">Tutorservices Learning Hub</span><h1>${page.heading}</h1><p>${page.lead}</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn btn-brand" href="/student-registration">Request a Tutor</a><a class="btn btn-light" href="/contact">Ask a Question</a></div></div></section>
    <section class="section-padding"><div class="container"><div class="row g-5 align-items-center"><div class="col-lg-6"><img class="rounded-media" src="${page.image}" alt="${page.imageAlt}" width="1000" height="750"></div><div class="col-lg-6"><span class="section-kicker">Pillar Guide</span><h2>${page.introTitle}</h2><p>${page.intro}</p><a class="btn btn-outline-brand" href="/student-registration">Share Learning Requirements</a></div></div></div></section>
    <section class="section-padding bg-cream"><div class="container"><div class="section-title text-center"><span class="section-kicker">Core Benefits</span><h2>What this learning option covers</h2></div><div class="row g-4">${cards}</div></div></section>
    <section class="section-padding"><div class="container"><div class="section-title"><span class="section-kicker">Learning Needs</span><h2>${page.audienceTitle}</h2></div><div class="row g-4">${audiences}</div></div></section>
    <section class="cta-split"><div class="container"><div class="cta-panel dark"><span class="section-kicker">Next Step</span><h2>Tell us the class, subject, board and preferred mode.</h2><p>Submit a complete requirement so Tutorservices can review the most relevant tutor options.</p><a class="btn btn-light" href="/student-registration">Book a Free Demo</a></div></div></section>
    <!-- Topic cluster links -->
  </main>
  ${footer()}
  <a class="sticky-whatsapp" href="https://wa.me/917011090796" aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a><a class="call-now" href="tel:+917011090796" aria-label="Call Tutorservices"><i class="fa-solid fa-phone"></i></a><button class="back-to-top" type="button" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
  <script src="script.min.js"></script>
</body>
</html>`;
}

for (const [fileName, config] of Object.entries(pages)) {
  fs.writeFileSync(path.join(root, fileName), renderPage(fileName, config), 'utf8');
}

console.log(`Generated ${Object.keys(pages).length} education pillar pages.`);
