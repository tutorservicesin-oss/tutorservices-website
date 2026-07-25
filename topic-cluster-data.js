const clusters = {
  homeTuition: {
    label: 'Home Tuition',
    pillarFile: 'home-tuition.html',
    description: 'Personal tutor matching, benefits, selection guidance and local availability.',
    members: [
      ['benefits-of-home-tuition.html', 'Benefits of home tuition', 'Understand where personal attention can help.'],
      ['best-home-tuition-services-india.html', 'Choosing a home tuition service', 'Compare tutors and evaluate a demo.'],
      ['how-we-verify-tutors.html', 'How TutorServices reviews tutors', 'Understand profile review, conditional checks and family responsibilities.'],
      ['tutor-code-of-conduct.html', 'Tutor Code of Conduct', 'Review professional standards for safety, preparation, communication and confidentiality.'],
      ['editorial-policy.html', 'TutorServices Editorial Policy', 'Understand how educational content is drafted, checked, corrected and updated.'],
      ['privacy-policy.html', 'TutorServices Privacy Policy', 'Understand enquiry data, analytics, external services and correction requests.'],
      ['terms-and-conditions.html', 'TutorServices Terms and Conditions', 'Review website rules, user responsibilities and service limitations.'],
      ['frequently-asked-questions.html', 'TutorServices frequently asked questions', 'Review matching, fees, demos, registrations and service policies.'],
      ['locations.html', 'Home tuition locations', 'Check Delhi areas and online alternatives.'],
      ['student-registration.html', 'Request a home tutor', 'Share class, board, subjects and locality.']
    ],
    related: ['classes', 'cities']
  },
  onlineTuition: {
    label: 'Online Tuition',
    pillarFile: 'online-tuition.html',
    description: 'Live online classes, learning setup, tutor selection and effective study routines.',
    members: [
      ['online-learning-tips.html', 'Online learning tips', 'Prepare, participate and revise effectively.'],
      ['courses.html', 'Online subjects and courses', 'Browse academic and skill-learning options.'],
      ['student-registration.html', 'Request an online tutor', 'Submit class, subject and timing details.'],
      ['spoken-english-guide.html', 'Online spoken English practice', 'Build fluency through guided conversation.']
    ],
    related: ['subjects', 'classes']
  },
  subjects: {
    label: 'Subjects',
    pillarFile: 'subjects.html',
    description: 'Academic subjects, languages, commerce, computer science and coding support.',
    members: [
      ['subjects/mathematics-tuition.html', 'Mathematics tuition', 'Find class-aligned home and online maths support.'],
      ['subjects/science-tuition.html', 'Science tuition', 'Find concept-focused home and online science support.'],
      ['subjects/english-tuition.html', 'English tuition', 'Build grammar, reading, writing and literature skills.'],
      ['subjects/physics-tuition.html', 'Physics tuition', 'Strengthen concepts, numericals and exam preparation.'],
      ['subjects/chemistry-tuition.html', 'Chemistry tuition', 'Build concepts, reactions, numericals and exam readiness.'],
      ['subjects/biology-tuition.html', 'Biology tuition', 'Build concepts, diagrams, recall and exam readiness.'],
      ['courses.html', 'Browse current subject options', 'Review academic, language, commerce and technology courses.'],
      ['spoken-english-guide.html', 'Spoken English guide', 'Improve speaking, listening and vocabulary.'],
      ['class-10-board-exam-preparation.html', 'Class 10 subject preparation', 'Plan revision across board subjects.'],
      ['student-registration.html', 'Request a subject tutor', 'State the exact subject and learning goal.']
    ],
    related: ['classes', 'exams']
  },
  boards: {
    label: 'Boards',
    pillarFile: 'boards.html',
    description: 'CBSE, ICSE and State Board tuition organised around curriculum and examination requirements.',
    members: [
      ['boards/cbse-tuition.html', 'CBSE tuition', 'Find NCERT-aligned home and online tuition for Classes 1 to 12.'],
      ['boards/icse-tuition.html', 'ICSE tuition', 'Build detailed subject knowledge, analytical skills and precise written expression.'],
      ['boards/state-board-tuition.html', 'State Board tuition', 'Find support aligned with regional syllabi, textbooks, languages and examinations.'],
      ['boards/class-10-board-tuition.html', 'Class 10 board tuition', 'Find subject support, regular testing and examination-focused tuition for the board year.'],
      ['boards/class-12-board-tuition.html', 'Class 12 board tuition', 'Find stream-specific subject experts, mock tests and university-ready board preparation.']
    ],
    related: ['subjects', 'classes', 'exams']
  },
  classes: {
    label: 'Classes',
    pillarFile: 'classes.html',
    description: 'Learning support from primary school through Class 12, organised by stage.',
    members: [
      ['classes/class-1-to-5-tuition.html', 'Class 1 to 5 tuition', 'Build reading, writing, numeracy, confidence and primary learning habits.'],
      ['classes/class-6-to-8-tuition.html', 'Class 6 to 8 tuition', 'Strengthen middle-school concepts, study habits, reasoning and secondary-school readiness.'],
      ['classes/class-9-tuition.html', 'Class 9 tuition', 'Master secondary concepts and build disciplined preparation before the Class 10 board year.'],
      ['classes/class-10-tuition.html', 'Class 10 tuition', 'Combine year-round subject learning, revision and steady board-year academic support.'],
      ['classes/class-11-tuition.html', 'Class 11 tuition', 'Build stream-specific concepts and senior-secondary study methods for higher-level learning.'],
      ['classes/class-12-tuition.html', 'Class 12 tuition', 'Balance final-year academics, boards, admissions and entrance-compatible subject learning.'],
      ['courses.html', 'Subjects for every class', 'Match subjects to the student’s current level.'],
      ['class-10-board-exam-preparation.html', 'Class 10 preparation', 'Build a focused board-exam plan.'],
      ['exam-preparation.html', 'Exam support by class', 'Combine concepts, revision and practice tests.'],
      ['student-registration.html', 'Request class-based support', 'Share class, board and weak subjects.']
    ],
    related: ['subjects', 'exams']
  },
  exams: {
    label: 'Exams',
    pillarFile: 'exam-preparation.html',
    description: 'School tests, board examinations and competitive-exam foundation support.',
    members: [
      ['class-10-board-exam-preparation.html', 'Class 10 board exam plan', 'Use revision cycles, papers and error logs.'],
      ['courses.html', 'Exam subjects', 'Find support for mathematics, science, commerce and languages.'],
      ['online-learning-tips.html', 'Online exam preparation', 'Use online lessons actively and consistently.'],
      ['student-registration.html', 'Request exam coaching', 'State the exam, subjects and target date.']
    ],
    related: ['classes', 'subjects']
  },
  competitiveExams: {
    label: 'Competitive Exams',
    pillarFile: 'competitive-exams.html',
    description: 'Foundation and entrance preparation pathways for JEE, NEET, CUET and Olympiads.',
    members: [
      ['competitive-exams/jee-foundation.html', 'JEE Foundation classes', 'Build Mathematics, Physics and Chemistry foundations for future engineering entrance study.'],
      ['competitive-exams/neet-foundation.html', 'NEET Foundation classes', 'Build Biology, Physics and Chemistry foundations for future medical entrance study.'],
      ['competitive-exams/cuet-preparation.html', 'CUET preparation classes', 'Plan programme-specific subjects, revision, practice and mock-test preparation.'],
      ['competitive-exams/olympiad-preparation.html', 'Olympiad preparation classes', 'Build subject mastery, logical reasoning and non-routine problem-solving skills.']
    ],
    related: ['exams', 'classes', 'subjects']
  },
  languages: {
    label: 'Languages',
    pillarFile: 'languages.html',
    description: 'Spoken English, grammar, Hindi and practical communication-skills learning.',
    members: [
      ['languages/spoken-english-classes.html', 'Spoken English classes', 'Build practical fluency, pronunciation, vocabulary and communication confidence.'],
      ['languages/english-grammar-classes.html', 'English grammar classes', 'Strengthen sentence construction, grammar accuracy and practical writing.'],
      ['spoken-english-guide.html', 'Spoken English guide', 'Build fluency through conversation, listening and vocabulary practice.'],
      ['subjects/english-tuition.html', 'Academic English tuition', 'Strengthen grammar, comprehension, writing and literature.']
    ],
    related: ['subjects', 'onlineTuition']
  },
  cities: {
    label: 'Cities',
    pillarFile: 'cities.html',
    description: 'Home tuition locations, Delhi-area tutor availability and online tuition across India.',
    members: [
      ['cities/delhi.html', 'Home tuition in Delhi', 'Explore Delhi subjects, classes, boards, exam support and locality-based tutor matching.'],
      ['cities/delhi/south-delhi-home-tuition.html', 'Home tuition in South Delhi', 'Review supported neighbourhoods, subjects, classes, boards and local tutor matching.'],
      ['cities/delhi/dwarka-home-tuition.html', 'Home tuition in Dwarka', 'Review sector-based availability, subjects, classes, boards and tutor matching.'],
      ['cities/delhi/rohini-home-tuition.html', 'Home tuition in Rohini', 'Explore supported sectors, academic pathways and tutor-matching guidance.'],
      ['cities/delhi/connaught-place-home-tuition.html', 'Home tuition in Connaught Place', 'Explore Central Delhi academic, language and practical learning support.'],
      ['locations.html', 'Delhi tuition service areas', 'Review current Delhi localities and location-based tutor matching guidance.']
    ],
    related: ['homeTuition', 'onlineTuition']
  }
};

const pageCluster = {
  'home-tuition.html': 'homeTuition',
  'benefits-of-home-tuition.html': 'homeTuition',
  'best-home-tuition-services-india.html': 'homeTuition',
  'how-we-verify-tutors.html': 'homeTuition',
  'tutor-code-of-conduct.html': 'homeTuition',
  'editorial-policy.html': 'homeTuition',
  'privacy-policy.html': 'homeTuition',
  'terms-and-conditions.html': 'homeTuition',
  'frequently-asked-questions.html': 'homeTuition',
  'online-tuition.html': 'onlineTuition',
  'online-learning-tips.html': 'onlineTuition',
  'subjects.html': 'subjects',
  'subjects/mathematics-tuition.html': 'subjects',
  'subjects/science-tuition.html': 'subjects',
  'subjects/english-tuition.html': 'subjects',
  'subjects/physics-tuition.html': 'subjects',
  'subjects/chemistry-tuition.html': 'subjects',
  'subjects/biology-tuition.html': 'subjects',
  'courses.html': 'subjects',
  'spoken-english-guide.html': 'subjects',
  'boards.html': 'boards',
  'boards/cbse-tuition.html': 'boards',
  'boards/icse-tuition.html': 'boards',
  'boards/state-board-tuition.html': 'boards',
  'boards/class-10-board-tuition.html': 'boards',
  'boards/class-12-board-tuition.html': 'boards',
  'classes.html': 'classes',
  'classes/class-1-to-5-tuition.html': 'classes',
  'classes/class-6-to-8-tuition.html': 'classes',
  'classes/class-9-tuition.html': 'classes',
  'classes/class-10-tuition.html': 'classes',
  'classes/class-11-tuition.html': 'classes',
  'classes/class-12-tuition.html': 'classes',
  'student-registration.html': 'classes',
  'exam-preparation.html': 'exams',
  'class-10-board-exam-preparation.html': 'exams',
  'competitive-exams.html': 'competitiveExams',
  'competitive-exams/jee-foundation.html': 'competitiveExams',
  'competitive-exams/neet-foundation.html': 'competitiveExams',
  'competitive-exams/cuet-preparation.html': 'competitiveExams',
  'competitive-exams/olympiad-preparation.html': 'competitiveExams',
  'languages.html': 'languages',
  'languages/spoken-english-classes.html': 'languages',
  'languages/english-grammar-classes.html': 'languages',
  'cities.html': 'cities',
  'cities/delhi.html': 'cities',
  'cities/delhi/south-delhi-home-tuition.html': 'cities',
  'cities/delhi/dwarka-home-tuition.html': 'cities',
  'cities/delhi/rohini-home-tuition.html': 'cities',
  'cities/delhi/connaught-place-home-tuition.html': 'cities',
  'locations.html': 'cities'
};

module.exports = { clusters, pageCluster };
