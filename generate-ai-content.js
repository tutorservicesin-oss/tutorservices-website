const fs = require('fs');
const path = require('path');

const root = __dirname;

const pages = {
  'index.html': {
    term: 'home tuition bureau',
    definition: 'A home tuition bureau connects students and parents with tutors based on class, board, subject, location, schedule and preferred learning mode.',
    summary: 'Tutorservices accepts the learning requirement, identifies a suitable tutor and helps the family arrange a demo before regular classes begin.',
    takeaways: ['Home, online, offline and group options are available.', 'Tutor matching uses the student’s academic and scheduling needs.', 'Parents can request a demo before deciding.'],
    steps: ['Share the class, board, subjects, city and preferred timing.', 'Review the tutor match suggested for the requirement.', 'Attend a demo and discuss learning goals.', 'Confirm the schedule and monitor progress.'],
    comparisonTitle: 'Compare tuition formats',
    comparison: [['Home tuition', 'Personal face-to-face support', 'Learning at the student’s home'], ['Online tuition', 'Flexible location and scheduling', 'Access from anywhere in India'], ['Group classes', 'Students comfortable learning together', 'Peer discussion and shared practice']]
  },
  'about.html': {
    term: 'Tutorservices',
    definition: 'Tutorservices is a tuition-matching service that helps students and parents find tutors for school subjects, skills and exam preparation in India.',
    summary: 'Founded by Meenakshi Sharma, the service supports home and online learning while also helping tutors connect with relevant teaching enquiries.',
    takeaways: ['The service supports students, parents and tutors.', 'Matching considers subject, board, location and timing.', 'Academic and skill-based learning options are included.'],
    steps: ['A family submits a clear learning requirement.', 'Tutorservices reviews the subject and location details.', 'A suitable tutor is identified for discussion or demo.', 'The family and tutor agree on goals, schedule and classes.'],
    comparisonTitle: 'Tutorservices roles at a glance',
    comparison: [['Students', 'Clear concepts and regular practice', 'Matched learning support'], ['Parents', 'A simpler tutor search', 'Requirement-based assistance'], ['Tutors', 'Relevant teaching opportunities', 'Student enquiry connections']],
    faqs: [['Who founded Tutorservices?', 'Tutorservices was founded by Meenakshi Sharma to help families find suitable tutors and help educators connect with teaching enquiries.'], ['Does Tutorservices teach students directly?', 'Tutorservices primarily helps match students with tutors. The selected tutor delivers the classes in the agreed mode and schedule.'], ['Which learners can use Tutorservices?', 'School students, exam learners, spoken English learners and students seeking computer or hobby classes can submit an enquiry.']]
  },
  'services.html': {
    term: 'tuition service',
    definition: 'A tuition service provides additional teaching support outside regular school through home, online, offline, individual or group classes.',
    summary: 'Tutorservices covers Class 1 to 12 academics, competitive-exam preparation, spoken English, computer courses and selected hobby classes.',
    takeaways: ['Students can choose personal or group learning.', 'Home and online formats support different schedules.', 'Requirements can be subject-specific or cover several subjects.'],
    steps: ['Identify the student’s class, board and weak subjects.', 'Choose home, online, offline or group tuition.', 'Share the city, timing and learning goals.', 'Attend a demo and confirm the most suitable plan.'],
    comparisonTitle: 'Compare Tutorservices learning options',
    comparison: [['One-to-one classes', 'Focused help and doubt solving', 'One student'], ['Group classes', 'Discussion and shared practice', 'Small learner group'], ['Skill classes', 'English, computers or hobbies', 'Goal-based learners']],
    faqs: [['Which classes and boards are supported?', 'Tutor enquiries are accepted for Class 1 to 12 students studying under CBSE, ICSE and State Board syllabi.'], ['Can a student request only one subject?', 'Yes. Families can request a tutor for one subject, several subjects or a specific exam-preparation need.'], ['Are both online and offline services available?', 'Yes. Availability depends on the subject, tutor, city and preferred schedule stated in the enquiry.']]
  },
  'courses.html': {
    term: 'Tutorservices course',
    definition: 'A Tutorservices course is tutor-led learning support for an academic subject or practical skill, selected according to the learner’s level and goals.',
    summary: 'Available areas include mathematics, science, languages, commerce, computer science, coding for children and spoken English.',
    takeaways: ['Course selection should match class level and learning goal.', 'Academic courses can follow school-board syllabi.', 'Skill courses focus on practical ability and regular practice.'],
    steps: ['Select the subject or skill the learner needs.', 'State the present level, class and board where relevant.', 'Choose a suitable learning mode and schedule.', 'Use the demo to confirm teaching style and course scope.'],
    comparisonTitle: 'Compare course categories',
    comparison: [['Academic subjects', 'School understanding and exams', 'Class and board syllabus'], ['Commerce subjects', 'Accounts, economics and business studies', 'Class 11 and 12 learners'], ['Skill courses', 'English, computers and coding', 'Practical confidence and ability']],
    faqs: [['Can courses follow the CBSE or ICSE syllabus?', 'Yes. Academic tutor requirements can specify CBSE, ICSE or a State Board syllabus.'], ['Are coding classes available for children?', 'Coding and computer-learning enquiries are accepted for children according to their age and current experience.'], ['How should parents choose a course?', 'Choose according to the learner’s class, present difficulties, target outcome, preferred mode and available weekly practice time.']]
  },
  'student-registration.html': {
    term: 'student tuition enquiry',
    definition: 'A student tuition enquiry is a request containing the learner’s class, board, subjects, location, mode and preferred timing so a suitable tutor can be identified.',
    summary: 'Accurate details produce a more relevant tutor match and reduce follow-up time before arranging a demo.',
    takeaways: ['Enter a reachable parent phone number and email.', 'State the exact board, class and subjects.', 'Explain weak topics, exam targets or scheduling limits.'],
    steps: ['Complete every required student and parent field.', 'Choose the preferred tuition mode.', 'Add the city and available timings.', 'Submit the form and respond when the team contacts you.'],
    comparisonTitle: 'Information that improves tutor matching',
    comparison: [['Academic details', 'Board, class and subjects', 'Matches subject expertise'], ['Learning goal', 'Weak topics or exam target', 'Clarifies teaching priorities'], ['Availability', 'City, mode and timing', 'Filters practical tutor options']],
    faqs: [['Is student registration free?', 'Submitting the student enquiry and requesting a demo does not require an online registration payment. Discuss teaching fees before regular classes begin.'], ['What happens after the form is submitted?', 'The requirement is reviewed and the family is contacted to discuss tutor availability and the next suitable step.'], ['Can parents request online tuition only?', 'Yes. Select online mode and provide the preferred timing so the enquiry can focus on online tutor options.']]
  },
  'tutor-registration.html': {
    term: 'tutor registration',
    definition: 'Tutor registration is the process of submitting teaching qualifications, experience, subjects and preferred locations to be considered for relevant student enquiries.',
    summary: 'Complete and accurate tutor profiles are easier to match with students who need the same subjects, class levels and teaching mode.',
    takeaways: ['List genuine qualifications and experience.', 'Specify subjects, classes and boards clearly.', 'Keep contact and preferred-location details current.'],
    steps: ['Enter personal and contact information.', 'Add qualifications and teaching experience.', 'List subject expertise and preferred location.', 'Upload the resume and submit the registration.'],
    comparisonTitle: 'What families assess in a tutor',
    comparison: [['Subject knowledge', 'Accurate explanations', 'Relevant qualification and expertise'], ['Teaching ability', 'Clear and patient instruction', 'Experience and demo performance'], ['Reliability', 'Regular classes and communication', 'Availability and professional conduct']],
    faqs: [['Does registration guarantee student leads?', 'No. Registration allows Tutorservices to consider the tutor for suitable enquiries, but availability and matching are not guaranteed.'], ['Which resume details are useful?', 'Include qualifications, teaching experience, subjects, class levels, boards, locations and any relevant certifications.'], ['Can tutors teach online?', 'Yes. Tutors can indicate online teaching preferences along with offline or home-tuition locations.']]
  },
  'contact.html': {
    term: 'tuition consultation',
    definition: 'A tuition consultation is a short discussion used to clarify the student’s learning needs before identifying an appropriate tutor or course option.',
    summary: 'Families should share the class, board, subjects, city, mode and timing; tutors should share qualifications, experience and teaching preferences.',
    takeaways: ['Use the student form for detailed learning requirements.', 'Use tutor registration for teaching applications.', 'Phone, email and WhatsApp are available for follow-up.'],
    steps: ['Choose whether the enquiry concerns a student or tutor.', 'Provide complete and accurate requirement details.', 'Submit the relevant form or contact the team.', 'Confirm the next action during the follow-up.'],
    comparisonTitle: 'Choose the correct contact method',
    comparison: [['Student form', 'Tutor or demo requirement', 'Complete academic details'], ['Tutor form', 'Teaching registration', 'Qualifications and experience'], ['Phone or WhatsApp', 'Quick clarification', 'Short follow-up questions']],
    faqs: [['What details should parents provide?', 'Share the student’s class, board, subjects, city, preferred mode, timings and main learning difficulty.'], ['How quickly will Tutorservices respond?', 'Response time depends on enquiry volume and tutor availability. Keep the submitted phone number reachable for follow-up.'], ['Can an enquiry be sent by WhatsApp?', 'Yes. WhatsApp can be used for an initial enquiry, although the registration forms collect more complete matching information.']]
  },
  'blog.html': {
    term: 'Tutorservices education blog',
    definition: 'The Tutorservices education blog is a practical resource for parents, students and tutors covering tuition choices, study methods, exams and communication skills.',
    summary: 'Articles are organised around common questions so readers can understand an issue, compare options and take a clear next step.',
    takeaways: ['Parent guides explain tutor selection and tuition formats.', 'Student guides cover revision, exams and online learning.', 'Skill guides support spoken English and computer learning.'],
    steps: ['Choose the topic closest to the current learning need.', 'Read the definition and key recommendations first.', 'Use the steps or comparison to make a practical plan.', 'Visit the related service or registration page if support is needed.'],
    comparisonTitle: 'Choose the right article type',
    comparison: [['Parent guide', 'Selecting tuition support', 'Decision criteria and questions'], ['Study guide', 'Improving academic habits', 'Actionable routines and revision'], ['Skill guide', 'English or computer learning', 'Practice methods and progress goals']],
    faqs: [['Who are the blog articles written for?', 'The articles are written for parents, school students, tutors and learners seeking practical academic or skill guidance.'], ['Are the articles a replacement for a tutor?', 'No. Articles provide general educational guidance; individual learning difficulties may require personalised teaching support.'], ['How can readers find related services?', 'Each article includes contextual links to relevant services, courses, locations or enquiry pages.']]
  },
  'locations.html': {
    term: 'tuition service area',
    definition: 'A tuition service area is a city or locality where home or offline tutor matching may be available; online tuition can serve learners beyond those local boundaries.',
    summary: 'Tutorservices focuses on Delhi-area home tuition enquiries and supports online tuition requirements from students across India.',
    takeaways: ['Local availability depends on tutor supply and timing.', 'Online tuition is not limited by neighbourhood.', 'Always provide a precise city and locality in the enquiry.'],
    steps: ['Check whether home or online tuition is preferred.', 'Provide the city, locality and nearby landmark where useful.', 'Add the subject, class and preferred schedule.', 'Review the available tutor option before confirming.'],
    comparisonTitle: 'Compare location-based options',
    comparison: [['Home tuition', 'Students wanting in-person support', 'Requires a nearby available tutor'], ['Online tuition', 'Students anywhere in India', 'No local travel requirement'], ['Offline group class', 'Learners near a class location', 'Fixed venue and schedule']],
    faqs: [['Is home tuition available everywhere in India?', 'Home-tuition availability depends on local tutor supply. Online tuition can be considered when a suitable nearby tutor is unavailable.'], ['Which Delhi areas are covered?', 'Enquiries are accepted from New Delhi, South Delhi, Dwarka, Rohini and surrounding areas, subject to tutor availability.'], ['Why is the exact locality important?', 'The locality helps assess travel distance, practical timings and whether a home tutor can regularly reach the student.']]
  },
  'benefits-of-home-tuition.html': {
    term: 'home tuition',
    definition: 'Home tuition is face-to-face teaching delivered at the student’s home, usually for one learner or a small group.',
    summary: 'Its main benefits are individual attention, immediate doubt solving, flexible pacing and less travel for the student.',
    takeaways: ['Personal attention can target specific weak areas.', 'The tutor can adapt explanations to the learner’s pace.', 'Regular goals and progress checks are still necessary.'],
    steps: ['Identify the subjects and concepts needing support.', 'Select a tutor with relevant board and class experience.', 'Agree on weekly goals, timings and practice expectations.', 'Review progress through tests, homework and feedback.'],
    comparisonTitle: 'Home tuition compared with alternatives',
    comparison: [['Home tuition', 'Personal attention at home', 'Flexible pace and direct feedback'], ['Coaching centre', 'Structured group instruction', 'Fixed batch and timetable'], ['Online tuition', 'Location-independent learning', 'Requires a device and stable internet']]
  },
  'best-home-tuition-services-india.html': {
    term: 'home tuition service',
    definition: 'A home tuition service helps families identify and evaluate tutors for personalised teaching at home or through online classes.',
    summary: 'A strong service collects detailed requirements, checks tutor suitability, supports a demo and keeps expectations clear before classes start.',
    takeaways: ['Choose by subject fit and teaching ability, not claims alone.', 'Discuss fees, timing, syllabus and goals before starting.', 'Use a demo to observe communication and explanation quality.'],
    steps: ['Write down the student’s exact learning requirement.', 'Shortlist tutors with relevant subject and board experience.', 'Ask focused questions and attend a demo class.', 'Set measurable goals and review progress regularly.'],
    comparisonTitle: 'Compare ways to find a tutor',
    comparison: [['Tuition bureau', 'Requirement-based matching support', 'Faster structured search'], ['Independent search', 'Families with trusted referrals', 'Direct selection and negotiation'], ['Coaching institute', 'Students preferring a fixed programme', 'Standard batch-based instruction']]
  },
  'online-learning-tips.html': {
    term: 'effective online learning',
    definition: 'Effective online learning is planned digital study in which the learner prepares, participates actively, practises after class and reviews progress.',
    summary: 'A quiet workspace, reliable device, clear questions and immediate revision make online tuition more useful.',
    takeaways: ['Join class with materials and questions ready.', 'Keep the camera, audio and internet setup tested.', 'Revise and practise soon after each lesson.'],
    steps: ['Prepare the device, notes and lesson topic.', 'Remove distractions and join on time.', 'Ask questions and write concise notes during class.', 'Complete practice work and review mistakes.'],
    comparisonTitle: 'Active versus passive online learning',
    comparison: [['Preparation', 'Topic and questions reviewed', 'Joining without a plan'], ['Participation', 'Questions, notes and practice', 'Only watching the screen'], ['Follow-up', 'Revision and assigned work', 'No review after class']]
  },
  'class-10-board-exam-preparation.html': {
    term: 'Class 10 board exam preparation plan',
    definition: 'A Class 10 board exam preparation plan is a dated schedule for syllabus completion, revision, written practice, sample papers and error correction.',
    summary: 'The plan should prioritise weak chapters while maintaining regular revision of high-confidence subjects.',
    takeaways: ['Complete concepts before intensive mock testing.', 'Practise answers under time limits.', 'Track repeated errors and revise them deliberately.'],
    steps: ['List every chapter and mark current confidence.', 'Set weekly targets for concepts and written practice.', 'Begin timed sample papers after core revision.', 'Analyse mistakes and repeat weak question types.'],
    comparisonTitle: 'Board-exam preparation phases',
    comparison: [['Concept phase', 'Complete chapters and doubts', 'Textbook questions and notes'], ['Revision phase', 'Strengthen recall and connections', 'Short notes and mixed practice'], ['Mock phase', 'Improve speed and accuracy', 'Timed papers and error logs']]
  },
  'spoken-english-guide.html': {
    term: 'spoken English fluency',
    definition: 'Spoken English fluency is the ability to express ideas clearly and naturally with understandable pronunciation, suitable vocabulary and practical grammar.',
    summary: 'Fluency improves through frequent speaking, careful listening, useful phrase practice and specific feedback.',
    takeaways: ['Speak every day instead of waiting for perfect grammar.', 'Learn phrases in context rather than isolated words.', 'Record, review and correct repeated mistakes.'],
    steps: ['Choose a familiar topic and prepare key phrases.', 'Speak aloud for several minutes without stopping.', 'Listen to the recording and note unclear parts.', 'Repeat the task using corrected vocabulary and pronunciation.'],
    comparisonTitle: 'Compare spoken-English learning formats',
    comparison: [['Self-practice', 'Building a daily habit', 'Flexible but limited feedback'], ['One-to-one class', 'Personal correction and goals', 'Focused speaking time'], ['Group class', 'Conversation with several learners', 'Varied interaction and confidence practice']]
  }
};

Object.assign(pages, {
  'home-tuition.html': {
    term: 'home tuition',
    definition: 'Home tuition is face-to-face teaching at the student’s home, usually for one learner or a small group, based on class, board, subject and schedule.',
    summary: 'It is most useful when a learner needs personal explanations, immediate doubt solving, regular practice and a timetable that fits school routines.',
    takeaways: ['Matching should consider board, class, subjects and locality.', 'A demo helps families assess communication and teaching style.', 'Regular goals and progress reviews make personal tuition more effective.'],
    steps: ['Identify weak subjects and a measurable learning goal.', 'Share the board, class, locality and available timings.', 'Attend a demo and observe how the tutor explains concepts.', 'Agree on a study plan and review progress regularly.'],
    comparisonTitle: 'Home tuition compared with other formats',
    comparison: [['Home tuition', 'Personal local support', 'Face-to-face lessons at home'], ['Online tuition', 'Flexible location and wider tutor access', 'Live digital classes'], ['Group coaching', 'Peer learning and fixed programmes', 'Shared instruction for several students']],
    faqs: [['Which classes can use home tuition?', 'Families can request home tuition from primary school through Class 12, subject to suitable tutor availability.'], ['Can parents request one subject only?', 'Yes. The enquiry can cover one weak subject, several subjects or a specific exam requirement.'], ['How is a home tutor selected?', 'Selection should consider subject knowledge, teaching experience, communication, local availability and performance during a demo.']]
  },
  'online-tuition.html': {
    term: 'online tuition',
    definition: 'Online tuition is live tutor-led teaching delivered through video, digital whiteboards, screen sharing and online learning resources.',
    summary: 'It removes location limits while still allowing questions, demonstrations, feedback and scheduled practice with a tutor.',
    takeaways: ['Students need a reliable device, internet connection and quiet workspace.', 'Tutor matching can extend beyond the local city.', 'Active participation and post-class practice are essential.'],
    steps: ['Choose the subject, level and learning goal.', 'Prepare a suitable device, workspace and class materials.', 'Join a demo and test communication and teaching tools.', 'Follow each class with revision and assigned practice.'],
    comparisonTitle: 'Online tuition compared with home tuition',
    comparison: [['Online tuition', 'Wider tutor choice and no travel', 'Live learning from any location'], ['Home tuition', 'In-person guidance', 'Tutor visits the student'], ['Recorded course', 'Self-paced review', 'No live personal interaction']],
    faqs: [['Is online tuition available across India?', 'Yes. Online matching is not restricted by the student’s city, although tutor schedules and subject availability still apply.'], ['What equipment is needed?', 'A phone, tablet or computer with stable internet, working audio and a quiet learning space is usually sufficient.'], ['Can online tutors prepare students for exams?', 'Yes. Online lessons can include concept teaching, written work review, sample papers and scheduled tests.']]
  },
  'classes.html': {
    term: 'tuition by class',
    definition: 'Tuition by class organises learning support around the student’s school stage, board syllabus, subject level and academic goals.',
    summary: 'Primary classes need strong foundations, middle classes need concept clarity, and Classes 9 to 12 need deeper subject work and exam planning.',
    takeaways: ['Teaching priorities should change as the student progresses.', 'Board and subject details become increasingly important in higher classes.', 'The tutor should teach at the learner’s present level, not only the textbook level.'],
    steps: ['Confirm the class, board and current syllabus.', 'Identify specific subjects and weak chapters.', 'Choose home or online tuition and suitable weekly timings.', 'Set age-appropriate goals and review them each month.'],
    comparisonTitle: 'Learning priorities by class stage',
    comparison: [['Class 1 to 5', 'Foundations and study habits', 'Reading, writing and numeracy'], ['Class 6 to 8', 'Concept development', 'Subject understanding and regular practice'], ['Class 9 to 12', 'Board and stream preparation', 'Depth, written answers and exam strategy']],
    faqs: [['Which classes are supported?', 'Tutor requirements can be submitted for Class 1 through Class 12 and for early-learning support where a suitable tutor is available.'], ['Does tuition follow the school board?', 'Yes. Parents should state CBSE, ICSE or the relevant State Board so the tutor can follow the correct syllabus.'], ['Can a student change subjects later?', 'Families can discuss changing priorities with the tutor or submit an updated requirement when academic needs change.']]
  },
  'exam-preparation.html': {
    term: 'exam preparation tuition',
    definition: 'Exam preparation tuition is structured teaching that combines concept coverage, revision, question practice, timed tests and mistake analysis for a defined exam.',
    summary: 'The best plan starts with the syllabus and target date, then allocates time according to topic importance and the learner’s current confidence.',
    takeaways: ['Concept gaps should be fixed before intensive mock testing.', 'Timed written practice improves speed and exam technique.', 'An error log turns repeated mistakes into revision priorities.'],
    steps: ['Map the syllabus and mark confident and weak topics.', 'Set weekly targets for learning, revision and written practice.', 'Complete timed papers under realistic conditions.', 'Analyse mistakes and repeat weak question types.'],
    comparisonTitle: 'Compare exam preparation stages',
    comparison: [['Concept stage', 'Incomplete chapters and doubts', 'Explanations and guided questions'], ['Revision stage', 'Improving recall', 'Short notes and mixed practice'], ['Mock stage', 'Building speed and accuracy', 'Timed papers and error analysis']],
    faqs: [['Which exams are supported?', 'Families can request support for school tests, Class 10 and 12 board exams and suitable competitive-exam foundation needs.'], ['When should preparation begin?', 'Start early enough to complete concepts before revision and timed papers; the exact period depends on syllabus size and current preparation.'], ['Can exam preparation be online?', 'Yes. Online tutors can teach concepts, review answers, set practice work and conduct scheduled tests.']]
  }
});

function renderList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="${ordered ? 'ai-steps' : 'ai-takeaways'}">${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
}

function renderComparison(rows) {
  return rows.map(([option, bestFor, advantage]) => `<tr><th scope="row">${option}</th><td>${bestFor}</td><td>${advantage}</td></tr>`).join('');
}

function renderFaqs(faqs, sectionId) {
  if (!faqs?.length) return '';
  return `
        <section class="ai-faq" aria-labelledby="${sectionId}-faq">
          <h2 id="${sectionId}-faq">Frequently asked questions</h2>
          <div class="ai-faq-grid">
            ${faqs.map(([question, answer]) => `<article><h3>${question}</h3><p>${answer}</p></article>`).join('\n            ')}
          </div>
        </section>`;
}

function renderSection(fileName, config) {
  const sectionId = `answer-guide-${path.basename(fileName, '.html')}`;
  return `
    <!-- AI-ready answer guide -->
    <section class="ai-answer-section section-padding" aria-labelledby="${sectionId}">
      <div class="container">
        <div class="ai-summary-box">
          <span class="section-kicker">Quick Answer</span>
          <h2 id="${sectionId}">What is ${config.term}?</h2>
          <p><strong>Definition:</strong> ${config.definition}</p>
          <p class="ai-summary-line"><strong>In summary:</strong> ${config.summary}</p>
        </div>

        <div class="ai-guide-grid">
          <section aria-labelledby="${sectionId}-takeaways">
            <h2 id="${sectionId}-takeaways">Key takeaways</h2>
            ${renderList(config.takeaways)}
          </section>
          <section aria-labelledby="${sectionId}-steps">
            <h2 id="${sectionId}-steps">Step-by-step guide</h2>
            ${renderList(config.steps, true)}
          </section>
        </div>

        <section class="ai-comparison" aria-labelledby="${sectionId}-comparison">
          <h2 id="${sectionId}-comparison">${config.comparisonTitle}</h2>
          <div class="ai-table-wrap">
            <table>
              <thead><tr><th scope="col">Option</th><th scope="col">Best for</th><th scope="col">Main point</th></tr></thead>
              <tbody>${renderComparison(config.comparison)}</tbody>
            </table>
          </div>
        </section>
        ${renderFaqs(config.faqs, sectionId)}
      </div>
    </section>
    <!-- /AI-ready answer guide -->
`;
}

for (const [fileName, config] of Object.entries(pages)) {
  const filePath = path.join(root, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<!-- AI-ready answer guide -->[\s\S]*?<!-- \/AI-ready answer guide -->\s*/gi, '\n');

  const insertionPoint = html.indexOf('<!-- Topic cluster links -->');
  if (insertionPoint < 0) throw new Error(`Missing topic-cluster insertion point in ${fileName}`);

  html = `${html.slice(0, insertionPoint)}${renderSection(fileName, config)}${html.slice(insertionPoint)}`;
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Generated AI-ready answer guides for ${Object.keys(pages).length} pages.`);
