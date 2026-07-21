const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

function toCleanUrl(fileName) {
  return fileName === 'index.html' ? '/' : `/${path.basename(fileName, '.html').toLowerCase()}`;
}

const clusters = {
  'index.html': {
    heading: 'Plan the next learning step',
    intro: 'Explore tutoring options, local availability and practical guidance for choosing support.',
    links: [
      ['services.html', 'Explore tuition options', 'Compare home, online, offline and skill-based learning.'],
      ['locations.html', 'Check service areas', 'See Delhi home-tuition areas and online availability across India.'],
      ['best-home-tuition-services-india.html', 'Read the parent guide', 'Understand what to check before selecting a tutor.']
    ]
  },
  'about.html': {
    heading: 'Learn more about our tuition support',
    intro: 'Move from our story to the services, areas and guidance most useful to your family.',
    links: [
      ['services.html', 'How tutor matching works', 'Review the learning formats and subjects currently supported.'],
      ['locations.html', 'Where support is available', 'Check home-tuition enquiries in Delhi and online options across India.'],
      ['best-home-tuition-services-india.html', 'A practical guide for parents', 'Compare tuition modes and learn how to assess a tutor.']
    ]
  },
  'services.html': {
    heading: 'Explore services by learning need',
    intro: 'Compare subjects, local availability and helpful guides before submitting an enquiry.',
    links: [
      ['courses.html', 'Browse subjects and courses', 'Find academic, language, commerce and technology options.'],
      ['locations.html', 'Check tutor availability by area', 'Review Delhi service areas and online access across India.'],
      ['benefits-of-home-tuition.html', 'When personal tuition can help', 'Learn how individual support may improve confidence and understanding.'],
      ['online-learning-tips.html', 'Make online lessons more effective', 'Use simple preparation and revision habits for better classes.']
    ]
  },
  'courses.html': {
    heading: 'Connect courses with the right support',
    intro: 'Choose a learning format, check availability and review focused study guidance.',
    links: [
      ['services.html', 'Compare learning formats', 'See home, online, offline, individual and group tuition.'],
      ['locations.html', 'Find support in your area', 'Check Delhi tutor matching and online tuition across India.'],
      ['class-10-board-exam-preparation.html', 'Build a board-exam plan', 'Organise revision, written practice and sample papers.'],
      ['spoken-english-guide.html', 'Practise confident English', 'Follow a simple routine for speaking and listening skills.']
    ]
  },
  'student-registration.html': {
    heading: 'Prepare before requesting a tutor',
    intro: 'Review available subjects, location support and guidance on choosing the right learning format.',
    links: [
      ['courses.html', 'Choose subjects and courses', 'Browse academic, language, commerce and computer learning.'],
      ['locations.html', 'Confirm the preferred area', 'Check home-tuition locations and nationwide online options.'],
      ['benefits-of-home-tuition.html', 'Understand one-to-one support', 'See how personal tuition can address individual learning needs.'],
      ['online-learning-tips.html', 'Consider online tuition', 'Learn what helps students stay focused during online classes.']
    ]
  },
  'tutor-registration.html': {
    heading: 'Understand student and service needs',
    intro: 'Review the services, areas and parent expectations connected with Tutorservices enquiries.',
    links: [
      ['services.html', 'Review teaching opportunities', 'See the academic and skill-learning services offered to families.'],
      ['locations.html', 'Explore service areas', 'Understand local Delhi enquiries and online teaching reach.'],
      ['best-home-tuition-services-india.html', 'What families consider', 'Read the factors parents use when choosing a tutor.'],
      ['blog.html', 'Visit the education blog', 'Explore study, tuition and communication-skills guides.']
    ]
  },
  'contact.html': {
    heading: 'Helpful links before you enquire',
    intro: 'Review services, availability and the parent guide, then share the details of your requirement.',
    links: [
      ['services.html', 'Review available services', 'Compare academic tuition, spoken English and computer courses.'],
      ['locations.html', 'Check location support', 'See where home tuition is matched and how online classes work across India.'],
      ['best-home-tuition-services-india.html', 'Learn how to choose a tutor', 'Use the complete guide to prepare for your enquiry.']
    ]
  },
  'blog.html': {
    heading: 'Turn guidance into a learning plan',
    intro: 'Connect the education guides with relevant services and tutor availability.',
    links: [
      ['services.html', 'Find a suitable tuition format', 'Compare personal, online, offline and group learning.'],
      ['locations.html', 'Explore location options', 'Check Delhi areas or choose online tuition from anywhere in India.'],
      ['best-home-tuition-services-india.html', 'Start with the complete parent guide', 'Understand tutor selection, subjects, boards and learning modes.']
    ]
  },
  'locations.html': {
    heading: 'Choose the right service for your location',
    intro: 'Compare learning formats, request a tutor or read practical guidance before deciding.',
    links: [
      ['services.html', 'Compare tuition services', 'Review home, online, offline and group learning options.'],
      ['student-registration.html', 'Share your requirements', 'Tell us the class, subject, board, mode and preferred area.'],
      ['best-home-tuition-services-india.html', 'Use the parent selection guide', 'Learn what to discuss before finalising a tutor.'],
      ['online-learning-tips.html', 'Prepare for online classes', 'Build a focused routine when location is not a limitation.']
    ]
  },
  'best-home-tuition-services-india.html': {
    heading: 'Continue exploring tuition options',
    intro: 'Compare services, availability and focused guidance for the student’s learning needs.',
    links: [
      ['services.html', 'See all learning formats', 'Review home, online, offline and group tuition choices.'],
      ['locations.html', 'Check local and online availability', 'Explore Delhi service areas and online access across India.'],
      ['student-registration.html', 'Request a suitable tutor', 'Share the student’s class, board, subjects and preferred mode.']
    ]
  },
  'benefits-of-home-tuition.html': {
    heading: 'Explore home-tuition next steps',
    intro: 'Move from the benefits to available services, tutor areas and a practical parent guide.',
    links: [
      ['services.html', 'Compare tuition arrangements', 'Review home, online, individual and group learning.'],
      ['locations.html', 'Check home-tutor areas', 'See Delhi service locations and online alternatives.'],
      ['student-registration.html', 'Request personalised support', 'Submit the class, subject, board and preferred timing.']
    ]
  },
  'online-learning-tips.html': {
    heading: 'Build an effective online learning plan',
    intro: 'Connect better study habits with the right service, location flexibility and tutor request.',
    links: [
      ['services.html', 'Review online and personal tuition', 'Compare the formats available through Tutorservices.'],
      ['locations.html', 'Learn where online support reaches', 'See local Delhi matching and online tuition across India.'],
      ['student-registration.html', 'Request an online tutor', 'Share the student’s class, subjects and preferred schedule.']
    ]
  },
  'class-10-board-exam-preparation.html': {
    heading: 'Connect the study plan with support',
    intro: 'Explore subject courses, tutor availability and online study guidance for board preparation.',
    links: [
      ['courses.html', 'Review Class 10 subjects', 'Browse mathematics, science, languages and computer learning.'],
      ['locations.html', 'Check tutor availability', 'Explore Delhi home tuition or online support across India.'],
      ['student-registration.html', 'Ask for exam support', 'Share weak subjects, board and preferred class timings.']
    ]
  },
  'spoken-english-guide.html': {
    heading: 'Continue building communication skills',
    intro: 'Connect daily practice with available learning services, flexible locations and online guidance.',
    links: [
      ['services.html', 'Explore spoken-English support', 'Review personal, online and group learning formats.'],
      ['locations.html', 'Check local or online options', 'See Delhi service areas and nationwide online availability.'],
      ['student-registration.html', 'Enquire about English classes', 'Share the learner’s level, goals and preferred timings.']
    ]
  }
};

Object.assign(clusters, {
  'home-tuition.html': {
    heading: 'Explore the home tuition hub',
    intro: 'Move from the overview to benefits, tutor selection, local availability and a complete enquiry.',
    links: [
      ['benefits-of-home-tuition.html', 'Understand the benefits', 'See when personal attention and home-based learning can help.'],
      ['best-home-tuition-services-india.html', 'Choose a suitable service', 'Use practical checks for tutor experience, teaching style and demos.'],
      ['locations.html', 'Check location availability', 'Review home-tuition areas and online alternatives.'],
      ['student-registration.html', 'Request a home tutor', 'Share the class, board, subjects, locality and timing.']
    ]
  },
  'online-tuition.html': {
    heading: 'Explore the online tuition hub',
    intro: 'Connect online tutor matching with subject options, practical learning habits and a complete enquiry.',
    links: [
      ['online-learning-tips.html', 'Build better online habits', 'Prepare the device, participate actively and revise after class.'],
      ['courses.html', 'Browse online subjects', 'Explore academic, language, commerce and technology learning.'],
      ['spoken-english-guide.html', 'Practise spoken English online', 'Use guided conversation, listening and feedback.'],
      ['student-registration.html', 'Request an online tutor', 'Share subjects, class level, goals and preferred timing.']
    ]
  },
  'classes.html': {
    heading: 'Choose support for the student’s class',
    intro: 'Connect class level with subjects, exam goals and a clear tutor requirement.',
    links: [
      ['courses.html', 'Browse subjects by level', 'Match academic and skill learning with the student’s current stage.'],
      ['class-10-board-exam-preparation.html', 'Plan Class 10 preparation', 'Combine concepts, revision, written practice and sample papers.'],
      ['exam-preparation.html', 'Explore exam support', 'Build a structured plan for school, board or foundation exams.'],
      ['student-registration.html', 'Request class-based tuition', 'State the class, board, subjects and learning goal.']
    ]
  },
  'exam-preparation.html': {
    heading: 'Continue building the exam plan',
    intro: 'Connect exam strategy with subject support, focused guides and a suitable tutor request.',
    links: [
      ['class-10-board-exam-preparation.html', 'Use the Class 10 plan', 'Follow revision cycles, timed papers and error analysis.'],
      ['courses.html', 'Review exam subjects', 'Find mathematics, science, commerce and language support.'],
      ['online-learning-tips.html', 'Prepare effectively online', 'Make live digital lessons active and consistent.'],
      ['student-registration.html', 'Request exam coaching', 'Share the exam, board, target date and weak subjects.']
    ]
  }
});

function renderCluster(fileName, cluster) {
  const sectionId = `topic-cluster-${path.basename(fileName, '.html')}`;
  const links = cluster.links.map(([href, title, description]) => `
          <a class="topic-cluster-link" href="${toCleanUrl(href)}">
            <span>${title}</span>
            <small>${description}</small>
          </a>`).join('');

  return `
    <!-- Topic cluster links -->
    <section class="topic-cluster-section" aria-labelledby="${sectionId}">
      <div class="container">
        <div class="topic-cluster-heading">
          <span class="section-kicker">Explore Related</span>
          <h2 id="${sectionId}">${cluster.heading}</h2>
          <p>${cluster.intro}</p>
        </div>
        <div class="topic-cluster-links">${links}
        </div>
      </div>
    </section>
    <!-- /Topic cluster links -->
`;
}

for (const [fileName, cluster] of Object.entries(clusters)) {
  const filePath = path.join(projectRoot, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<!-- Topic cluster links -->[\s\S]*?<!-- \/Topic cluster links -->/gi, '');
  html = html.replace(/\s*<\/main>/i, `${renderCluster(fileName, cluster)}  </main>`);
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Generated contextual topic clusters for ${Object.keys(clusters).length} pages.`);
