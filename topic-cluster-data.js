const clusters = {
  homeTuition: {
    label: 'Home Tuition',
    pillarFile: 'home-tuition.html',
    description: 'Personal tutor matching, benefits, selection guidance and local availability.',
    members: [
      ['benefits-of-home-tuition.html', 'Benefits of home tuition', 'Understand where personal attention can help.'],
      ['best-home-tuition-services-india.html', 'Choosing a home tuition service', 'Compare tutors and evaluate a demo.'],
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
      ['boards/icse-tuition.html', 'ICSE tuition', 'Build detailed subject knowledge, analytical skills and precise written expression.']
    ],
    related: ['subjects', 'classes', 'exams']
  },
  classes: {
    label: 'Classes',
    pillarFile: 'classes.html',
    description: 'Learning support from primary school through Class 12, organised by stage.',
    members: [
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
  cities: {
    label: 'Cities',
    pillarFile: 'locations.html',
    description: 'Home-tuition service areas in Delhi and online tuition availability across India.',
    members: [
      ['home-tuition.html', 'Home tuition by locality', 'Understand how location affects matching.'],
      ['online-tuition.html', 'Online tuition across India', 'Choose learning without a local travel limit.'],
      ['services.html', 'Services by learning mode', 'Compare home, online and offline support.'],
      ['student-registration.html', 'Submit a city requirement', 'Include city, locality and preferred timing.']
    ],
    related: ['homeTuition', 'onlineTuition']
  }
};

const pageCluster = {
  'home-tuition.html': 'homeTuition',
  'benefits-of-home-tuition.html': 'homeTuition',
  'best-home-tuition-services-india.html': 'homeTuition',
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
  'classes.html': 'classes',
  'student-registration.html': 'classes',
  'exam-preparation.html': 'exams',
  'class-10-board-exam-preparation.html': 'exams',
  'locations.html': 'cities'
};

module.exports = { clusters, pageCluster };
