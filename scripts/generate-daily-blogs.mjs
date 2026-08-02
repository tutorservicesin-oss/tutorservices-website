import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const today = new Date();
const isoDate = today.toISOString().slice(0, 10);
const displayDate = today.toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata"
});

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_DAILY_BLOG_MODEL || "gpt-5";

const imagePool = [
  {
    url: "https://images.unsplash.com/photo-1758612898304-1a6bb546ac44?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Unsplash / Vitaly Gariev",
    alt: "Student learning online with a laptop at home"
  },
  {
    url: "https://images.pexels.com/photos/8457297/pexels-photo-8457297.jpeg?cs=srgb&fm=jpg&w=1600",
    credit: "Pexels / Norma Mortenson",
    alt: "Children studying together with notebooks and a laptop"
  },
  {
    url: "https://images.pexels.com/photos/6238038/pexels-photo-6238038.jpeg?cs=srgb&fm=jpg&w=1600",
    credit: "Pexels / Monstera Production",
    alt: "Students working together on mathematics during group study"
  },
  {
    url: "https://images.pexels.com/photos/6238046/pexels-photo-6238046.jpeg?cs=srgb&fm=jpg&w=1600",
    credit: "Pexels / Monstera Production",
    alt: "Students studying together in a bright classroom"
  },
  {
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Unsplash / Kenny Eliason",
    alt: "Teacher helping students in a classroom"
  },
  {
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Unsplash / Kimberly Farmer",
    alt: "Books and learning materials for school study"
  }
];

const topicPool = [
  {
    topic: "How to Choose the Right Maths Tutor for Class 10",
    primaryKeyword: "Class 10 Maths Tutor",
    slug: "how-to-choose-class-10-maths-tutor",
    category: "Maths Tuition",
    intent: "Commercial parent guide"
  },
  {
    topic: "Best Study Timetable for School Students",
    primaryKeyword: "Study Timetable for Students",
    slug: "study-timetable-for-school-students",
    category: "Study Skills",
    intent: "Informational study guide"
  },
  {
    topic: "CBSE vs ICSE Tuition: What Parents Should Know",
    primaryKeyword: "CBSE vs ICSE Tuition",
    slug: "cbse-vs-icse-tuition",
    category: "Boards",
    intent: "Comparison guide"
  },
  {
    topic: "How Online Tuition Helps Shy Students Ask Doubts",
    primaryKeyword: "Online Tuition for Shy Students",
    slug: "online-tuition-for-shy-students",
    category: "Online Tuition",
    intent: "Informational service guide"
  },
  {
    topic: "Home Tuition for Weak Students: A Practical Parent Guide",
    primaryKeyword: "Home Tuition for Weak Students",
    slug: "home-tuition-for-weak-students",
    category: "Home Tuition",
    intent: "Commercial parent guide"
  },
  {
    topic: "Science Tuition for Class 9 and 10 Students",
    primaryKeyword: "Science Tuition for Class 9 and 10",
    slug: "science-tuition-class-9-and-10",
    category: "Science Tuition",
    intent: "Commercial subject guide"
  },
  {
    topic: "English Grammar Practice Plan for School Students",
    primaryKeyword: "English Grammar Practice",
    slug: "english-grammar-practice-for-school-students",
    category: "English Grammar",
    intent: "Informational language guide"
  },
  {
    topic: "How Parents Can Track Tuition Progress at Home",
    primaryKeyword: "Track Tuition Progress",
    slug: "how-parents-track-tuition-progress",
    category: "Parent Guide",
    intent: "Informational trust guide"
  },
  {
    topic: "One-to-One Tuition vs Group Tuition for School Students",
    primaryKeyword: "One-to-One Tuition vs Group Tuition",
    slug: "one-to-one-vs-group-tuition",
    category: "Tuition Guide",
    intent: "Comparison guide"
  },
  {
    topic: "Board Exam Revision Strategy for Class 10 Students",
    primaryKeyword: "Class 10 Revision Strategy",
    slug: "class-10-board-exam-revision-strategy",
    category: "Board Exams",
    intent: "Informational exam guide"
  },
  {
    topic: "How to Find a Home Tutor Near You Safely",
    primaryKeyword: "Home Tutor Near Me",
    slug: "how-to-find-home-tutor-near-me-safely",
    category: "Home Tuition",
    intent: "Local commercial guide"
  },
  {
    topic: "Online Tuition Setup Checklist for Parents",
    primaryKeyword: "Online Tuition Setup",
    slug: "online-tuition-setup-checklist",
    category: "Online Tuition",
    intent: "Practical checklist"
  }
];

const existingHtml = new Set(
  fs.readdirSync(root)
    .filter((fileName) => fileName.endsWith(".html"))
    .map((fileName) => fileName.replace(/\.html$/, ""))
);

const availableTopics = topicPool.filter((item) => !existingHtml.has(item.slug));
if (availableTopics.length < 2) {
  throw new Error("Not enough unused blog topics remain in the topic pool.");
}

const daySeed = Math.floor(today.getTime() / 86400000);
const firstIndex = daySeed % availableTopics.length;
const selectedTopics = [
  availableTopics[firstIndex],
  availableTopics[(firstIndex + 5) % availableTopics.length]
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashString(value) {
  let hash = 0;
  for (const character of String(value)) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0);
    hash |= 0;
  }
  return hash;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ");
}

function countWords(value) {
  return (stripHtml(value).match(/\b[\w'-]+\b/g) || []).length;
}

async function callOpenAI(body) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}: ${text.slice(0, 500)}`);
  }

  const data = JSON.parse(text);
  return data.output_text || data.output?.flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("\n") || "";
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    return JSON.parse(match[0]);
  }
}

async function generateArticle(topicInfo) {
  const prompt = `Create one original TutorServices SEO blog article.

Return valid JSON only with this shape:
{
  "seoTitle": "",
  "metaTitle": "",
  "metaDescription": "",
  "h1": "",
  "introParagraphs": ["", "", ""],
  "quickAnswer": {"heading": "", "paragraphs": ["", ""]},
  "sections": [{"h2": "", "paragraphs": ["", ""], "h3Blocks": [{"h3": "", "paragraphs": [""]}]}],
  "comparisonTable": {"heading": "", "headers": ["", "", ""], "rows": [["", "", ""]]},
  "faqs": [{"question": "", "answer": ""}],
  "conclusion": ["", ""],
  "longTailKeywords": ["", "", "", "", ""],
  "imageAlt": ""
}

Rules:
- Topic: ${topicInfo.topic}
- Primary keyword: ${topicInfo.primaryKeyword}
- Search intent: ${topicInfo.intent}
- Write approximately 2500 words.
- Use the primary keyword naturally 8 to 10 times in visible content.
- Use 5 to 8 related long-tail keywords naturally.
- Use simple human English with light natural Hinglish for Indian parents/students.
- No keyword stuffing.
- No fake guarantees, marks promises, rank promises, admissions promises, or fake office claims.
- Include helpful H2 and H3 headings.
- Include practical steps, parent guidance, and answer-first writing.
- Include internal links naturally to these exact URLs:
  https://www.tutorservices.in/services.html
  https://www.tutorservices.in/about.html
  https://www.tutorservices.in/contact.html
- Also include relevant internal paths where useful, such as /home-tuition, /online-tuition, /classes, /subjects, /boards, /student-registration.
- FAQ answers should be concise and truthful.
- Keep all content original and suitable for Google indexing.`;

  if (!apiKey) {
    console.warn(`OPENAI_API_KEY is not configured; using local fallback article for ${topicInfo.slug}.`);
    return generateFallbackArticle(topicInfo);
  }

  try {
    const output = await callOpenAI({
      model,
      input: [
        {
          role: "developer",
          content: "You write production-ready SEO education content for TutorServices. Output strict JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      },
      max_output_tokens: 18000
    });

    return parseJson(output);
  } catch (error) {
    console.warn(`OpenAI generation failed for ${topicInfo.slug}; using local fallback article. ${error.message}`);
    return generateFallbackArticle(topicInfo);
  }
}

function generateFallbackArticle(topicInfo) {
  const primary = topicInfo.primaryKeyword;
  const title = `${primary}: A Practical TutorServices Guide`;
  const longTailKeywords = [
    `${primary} near me`,
    `${primary} for school students`,
    `online support for ${primary.toLowerCase()}`,
    `home tuition guidance for ${primary.toLowerCase()}`,
    `private tutor help for ${primary.toLowerCase()}`,
    `parent guide for ${primary.toLowerCase()}`,
    `personalised learning for ${primary.toLowerCase()}`
  ];

  const sectionIdeas = [
    ["Why this topic matters for students", "Students usually improve when learning support is matched to their class, board, pace and confidence level. A clear plan prevents confusion and helps the student know what to revise, what to practise and when to ask doubts. Parents also get a better picture of daily learning instead of waiting for exam results.", "Good tutoring is not only about finishing chapters. It is about noticing where the student hesitates, explaining the same idea in a simpler way and giving enough practice until the concept becomes comfortable. This is especially useful when school lessons move quickly.", `For many families, ${primary} becomes important when marks, confidence or study discipline need attention. The right tutor can create a calmer routine, reduce last-minute pressure and help the student stay regular.`],
    ["How TutorServices approaches learning", "TutorServices focuses on requirement-based tutor matching. Parents can share the class, subject, board, preferred mode, timing and expected tuition fee so the search becomes more practical from the beginning.", "The aim is to connect students with suitable tutors for home tuition, online tuition, one-to-one learning or small-group support depending on availability and learning goals. No responsible education service should promise guaranteed marks, but consistent guidance can make preparation more organised.", `When a parent asks for ${primary}, the important details are the student's current level, weak areas, examination timeline and preferred communication style. These details help create a better match.`],
    ["Signs a student may need extra support", "Some students need support because they have missed earlier concepts. Others understand theory but struggle with practice, writing answers, time management or regular revision. A tutor can identify these gaps through normal lessons and simple assessments.", "Parents may notice low confidence, incomplete homework, careless mistakes, difficulty concentrating, fear of tests or reluctance to ask questions in class. These signs do not mean the child is weak. They simply show that the student may need a different teaching pace.", `In such situations, ${primary} can help by giving the student a safe space to ask basic questions without embarrassment. Thoda patience and regular practice can change the learning experience.`],
    ["Home tuition and online tuition options", "Home tuition is useful when the student learns better through face-to-face interaction, needs a fixed study routine or benefits from direct supervision. It also helps younger students who may need more structure during lessons.", "Online tuition is useful when families want flexibility, access to tutors beyond their immediate location or a convenient option without travel. With the right tutor, online classes can still be interactive through screen sharing, digital notes and regular doubt-solving.", `TutorServices can help parents explore both options for ${primary}. The better choice depends on the student's age, attention span, subject difficulty, schedule and comfort with technology.`],
    ["What parents should discuss before starting", "Before finalising tuition, parents should clearly explain the student's class, board, subjects, school performance, homework load and target areas. This avoids mismatch and helps the tutor prepare suitable lessons.", "It is also useful to discuss timing, mode of learning, expected tuition fees, frequency of classes and whether the student needs regular study support or exam-focused preparation. Clear expectations make the learning relationship smoother.", `For ${primary}, parents should ask how the tutor will revise concepts, give practice work, track progress and communicate updates. A transparent discussion saves time later.`],
    ["A practical weekly learning plan", "A good weekly plan usually includes concept explanation, guided examples, independent practice, homework review, doubt clearing and short revision. The plan should be simple enough to follow and flexible enough to adjust when the student needs more time.", "For exam-oriented students, the tutor may add chapter-wise tests, sample questions, timed practice and revision notes. For younger students, the plan may include activities, reading practice, worksheets and parent feedback.", `The best plan for ${primary} is the one the student can actually follow. Overloading a child with too much work often creates stress, while small consistent tasks build confidence.`],
    ["How progress can be measured", "Progress should not be measured only through marks. Better homework completion, fewer repeated mistakes, improved confidence, stronger explanations and more regular study habits are also important signs.", "Parents can review progress every few weeks by checking notebooks, test scores, tutor feedback and the student's own comfort level. If a method is not working, it should be adjusted early instead of waiting for exams.", `In ${primary}, progress may appear slowly at first. Once basics become clear, students usually solve questions faster and feel less afraid of the subject.`],
    ["Common mistakes to avoid", "One common mistake is choosing a tutor only by price without checking subject fit, communication style and availability. Another mistake is expecting instant improvement without regular practice from the student.", "Parents should also avoid changing tutors too quickly unless there is a genuine mismatch. Learning needs some time, especially when the student has older gaps. At the same time, feedback should be honest if lessons are not helping.", `For ${primary}, the best results come from teamwork between student, parent and tutor. Regular classes, clear communication and realistic goals matter more than shortcuts.`],
    ["Why a personalised approach works better", "Every student has a different learning speed. Some need visual examples, some need more writing practice, some need repeated revision and some need motivation. A personalised approach respects these differences.", "This is where private tuition can feel more comfortable than a large batch. The tutor can slow down, repeat, ask questions, check understanding and modify examples according to the student's class level.", `For families searching for ${primary}, personalised learning helps turn a general requirement into a clear plan. It makes the tuition more focused, practical and student-friendly.`],
    ["How to get started with TutorServices", "Parents can begin by sharing the student's details and learning requirements through TutorServices. The more specific the enquiry, the easier it becomes to understand what type of tutor may fit the student.", "Useful details include class, board, subject, mode, location if home tuition is needed, preferred time, expected fee and current academic concern. This helps avoid unnecessary back-and-forth.", `You can explore services at https://www.tutorservices.in/services.html, learn about TutorServices at https://www.tutorservices.in/about.html, or contact the team at https://www.tutorservices.in/contact.html for ${primary} support.`]
  ];

  return {
    seoTitle: title,
    metaTitle: `${primary} | TutorServices`,
    metaDescription: `Looking for ${primary}? Learn how TutorServices helps parents choose suitable home and online tutors with practical, personalised support.`,
    h1: title,
    introParagraphs: [
      `${primary} is a common search for parents who want dependable academic support without confusing promises or one-size-fits-all coaching. Students learn better when lessons match their class, board, subject level and daily routine.`,
      `TutorServices helps families explore tutor options for home tuition, online tuition, one-to-one learning and related academic support. The focus is simple: understand the student's need, match the requirement carefully and support regular learning.`,
      `This guide explains how parents can think about ${primary}, what to discuss before hiring a tutor and how to build a study plan that feels realistic for Indian school students. The language is simple, practical and parent-friendly.`
    ],
    quickAnswer: {
      heading: `Quick answer: what is the best way to use ${primary}?`,
      paragraphs: [
        `The best way to use ${primary} is to first identify the student's exact difficulty, then choose a tutor who can teach at the right pace and provide regular practice. Parents should discuss class, board, subject, timings and expected tuition fee before classes begin.`,
        `A tutor cannot guarantee marks, but a clear learning plan can improve consistency, confidence and exam readiness. For many students, that steady support makes studying less stressful.`
      ]
    },
    sections: sectionIdeas.map(([h2, first, second, third]) => ({
      h2,
      paragraphs: [first, second, third],
      h3Blocks: [
        {
          h3: "Parent checklist",
          paragraphs: [
            "Check the student's current level, preferred learning mode, weekly availability and comfort with the tutor's teaching style. Keep goals specific, such as improving chapter understanding, completing homework regularly or preparing for upcoming tests."
          ]
        }
      ]
    })),
    comparisonTable: {
      heading: "Home tuition, online tuition and group learning",
      headers: ["Learning option", "Best for", "What parents should check"],
      rows: [
        ["Home tuition", "Students who need face-to-face guidance and routine", "Tutor availability, travel area, timing and safety expectations"],
        ["Online tuition", "Students who want flexible classes from home", "Internet quality, interaction style and digital practice method"],
        ["One-to-one tuition", "Students needing personal attention and custom pacing", "Learning plan, feedback process and progress tracking"],
        ["Group tuition", "Students who learn well with peers and want affordability", "Batch size, level matching and doubt-solving time"]
      ]
    },
    faqs: [
      { question: `How do I start with ${primary}?`, answer: "Share the student's class, board, subject requirement, preferred mode, timing and expected fee with TutorServices so the requirement can be understood clearly." },
      { question: "Can I choose between home tuition and online tuition?", answer: "Yes. Families can explore home tuition or online tuition depending on availability, location, schedule and the student's comfort." },
      { question: "Does TutorServices guarantee marks?", answer: "No. TutorServices helps connect students with suitable tutors, but marks depend on regular study, practice, attendance and exam performance." },
      { question: "Can parents discuss expected tuition fees?", answer: "Yes. Parents can mention expected tuition fees while sharing requirements so tutor matching can be more practical." },
      { question: "Is one-to-one learning available?", answer: "One-to-one tuition may be available depending on the subject, location, mode and tutor availability." },
      { question: "Are online classes useful for school students?", answer: "Online classes can be useful when the tutor keeps lessons interactive, gives practice work and reviews doubts regularly." },
      { question: "How often should tuition classes happen?", answer: "Frequency depends on the student's class, subject difficulty and goals. Many students benefit from two to four sessions per week." },
      { question: "Can tuition help with homework?", answer: "Yes. Tutors can support homework, revision and concept clarity, while also encouraging the student to work independently." },
      { question: "What should I check before finalising a tutor?", answer: "Check subject knowledge, teaching style, communication, schedule fit and whether the student feels comfortable asking doubts." },
      { question: "How can I contact TutorServices?", answer: "You can use the Contact page at https://www.tutorservices.in/contact.html to share your tuition requirement." }
    ],
    conclusion: [
      `${primary} works best when the focus is clear learning, not pressure. A student-friendly tutor can make difficult topics easier, create regular study habits and help parents understand progress more clearly.`,
      `If you want support for school studies, homework, exam preparation or subject-wise learning, visit https://www.tutorservices.in/services.html, read more at https://www.tutorservices.in/about.html or contact https://www.tutorservices.in/contact.html.`
    ],
    longTailKeywords,
    imageAlt: `${primary} guide by TutorServices`
  };
}

async function createBlogImage(topicInfo, article) {
  const imageFileName = `${topicInfo.slug}-study-guide.jpg`;
  const imagePath = path.join(root, "assets", "images", imageFileName);
  const imageChoice = imagePool[Math.abs(hashString(topicInfo.slug)) % imagePool.length];

  try {
    const response = await fetch(imageChoice.url, {
      headers: {
        "User-Agent": "TutorServices daily blog automation"
      }
    });
    if (!response.ok) {
      throw new Error(`Image download failed ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(imagePath, buffer);
    article.imageAlt = article.imageAlt || `${imageChoice.alt} for TutorServices ${topicInfo.category}`;
  } catch (error) {
    console.warn(`Image download failed for ${topicInfo.slug}; using existing fallback image. ${error.message}`);
    return "/assets/images/parent-student-tutor-study-plan.jpg";
  }

  return `/assets/images/${imageFileName}`;
}

function renderArticleHtml(topicInfo, article, imageUrl) {
  const canonical = `https://www.tutorservices.in/${topicInfo.slug}`;
  const localDate = displayDate;
  const faqEntities = (article.faqs || []).slice(0, 10).map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": stripHtml(faq.answer)
    }
  }));

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.tutorservices.in/#business",
        "name": "Tutorservices",
        "url": "https://www.tutorservices.in/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.tutorservices.in/assets/tutor-services-logo.png"
        },
        "email": "tutorservices.in@gmail.com",
        "telephone": "+91-7011090796"
      },
      {
        "@type": "WebSite",
        "@id": "https://www.tutorservices.in/#website",
        "url": "https://www.tutorservices.in/",
        "name": "Tutorservices",
        "inLanguage": "en-IN",
        "publisher": {
          "@id": "https://www.tutorservices.in/#business"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        "url": canonical,
        "name": article.h1,
        "description": article.metaDescription,
        "inLanguage": "en-IN",
        "isPartOf": {
          "@id": "https://www.tutorservices.in/#website"
        },
        "breadcrumb": {
          "@id": `${canonical}#breadcrumb`
        },
        "mainEntity": {
          "@id": `${canonical}#article`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.tutorservices.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.tutorservices.in/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.h1,
            "item": canonical
          }
        ]
      },
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        "headline": article.h1,
        "description": article.metaDescription,
        "datePublished": isoDate,
        "dateModified": isoDate,
        "inLanguage": "en-IN",
        "mainEntityOfPage": {
          "@id": `${canonical}#webpage`
        },
        "image": `https://www.tutorservices.in${imageUrl}`,
        "author": {
          "@type": "Organization",
          "name": "Tutorservices Editorial Team",
          "url": "https://www.tutorservices.in/editorial-policy"
        },
        "publisher": {
          "@id": "https://www.tutorservices.in/#business"
        },
        "articleSection": topicInfo.category,
        "keywords": [topicInfo.primaryKeyword, ...(article.longTailKeywords || [])]
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        "mainEntity": faqEntities
      }
    ]
  };

  const sectionHtml = (article.sections || []).map((section) => `
        <h2>${escapeHtml(section.h2)}</h2>
        ${(section.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("\n        ")}
        ${(section.h3Blocks || []).map((block) => `
        <h3>${escapeHtml(block.h3)}</h3>
        ${(block.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("\n        ")}`).join("\n")}`).join("\n");

  const table = article.comparisonTable;
  const tableHtml = table?.rows?.length ? `
        <h2>${escapeHtml(table.heading)}</h2>
        <div class="ai-table-wrap">
          <table>
            <thead><tr>${table.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead>
            <tbody>${table.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>` : "";

  const faqHtml = (article.faqs || []).slice(0, 10).map((faq, index) => `
        <h3>${index + 1}. ${escapeHtml(faq.question)}</h3>
        <p>${faq.answer}</p>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="theme-color" content="#050816">
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    function loadTutorservicesAnalytics(){
      if (window.tutorservicesAnalyticsLoaded) return;
      window.tutorservicesAnalyticsLoaded = true;
      const tag = document.createElement("script");
      tag.async = true;
      tag.src = "https://www.googletagmanager.com/gtag/js?id=G-KNFJRWMJHZ";
      document.head.appendChild(tag);
      gtag("js", new Date());
      gtag("config", "G-KNFJRWMJHZ");
    }
    ["pointerdown", "keydown"].forEach((eventName) =>
      window.addEventListener(eventName, loadTutorservicesAnalytics, { once: true, passive: true })
    );
    window.addEventListener("load", () => window.setTimeout(loadTutorservicesAnalytics, 10000), { once: true });
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.seoTitle || article.metaTitle || article.h1)}</title>
  <meta name="description" content="${escapeHtml(article.metaDescription)}">
  <meta name="keywords" content="${escapeHtml([topicInfo.primaryKeyword, ...(article.longTailKeywords || [])].join(", "))}">
  <meta name="author" content="Tutorservices Editorial Team">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(article.metaTitle || article.h1)}">
  <meta property="og:description" content="${escapeHtml(article.metaDescription)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Tutorservices">
  <meta property="og:image" content="https://www.tutorservices.in${imageUrl}">
  <meta property="og:image:alt" content="${escapeHtml(article.imageAlt || article.h1)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.metaTitle || article.h1)}">
  <meta name="twitter:description" content="${escapeHtml(article.metaDescription)}">
  <meta name="twitter:image" content="https://www.tutorservices.in${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(article.imageAlt || article.h1)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&amp;family=Poppins:wght@400;500;600;700&amp;display=optional" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&amp;family=Poppins:wght@400;500;600;700&amp;display=optional"></noscript>
  <link rel="stylesheet" href="layout.min.css">
  <link rel="stylesheet" href="style.min.css?v=20260721-neon3">
  <link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon.png">
  <link rel="apple-touch-icon" sizes="128x128" href="/assets/tutor-services-logo.png">
  <link rel="manifest" href="/site.webmanifest">
  <script type="application/ld+json">
  ${JSON.stringify(graph, null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand" href="/"><img src="/assets/tutor-services-logo.png" alt="Tutorservices home tuition and online tutoring logo" width="128" height="128"><span class="brand-copy">tutorservices<small>Learn Smarter, Achieve Faster</small></span></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="/about">About</a></li>
            <li class="nav-item"><a class="nav-link" href="/services">Services</a></li>
            <li class="nav-item"><a class="nav-link" href="/courses">Courses</a></li>
            <li class="nav-item"><a class="nav-link active" href="/blog">Blog</a></li>
            <li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
            <li class="nav-item"><a class="btn btn-sm btn-brand ms-lg-3" href="/student-registration">Book Demo</a></li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <main class="article-page">
    <section class="article-hero">
      <div class="container">
        <nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item"><a href="/blog">Blog</a></li><li class="breadcrumb-item active" aria-current="page">${escapeHtml(topicInfo.category)}</li></ol></nav>
        <span class="section-kicker">${escapeHtml(topicInfo.category)}</span>
        <h1>${escapeHtml(article.h1)}</h1>
        <p class="lead">${escapeHtml(article.metaDescription)}</p>
        <div class="article-meta"><span><i class="fa-regular fa-calendar"></i> ${localDate}</span><span><i class="fa-regular fa-clock"></i> 12 minute read</span><span><i class="fa-regular fa-user"></i> Tutorservices Editorial Team</span></div>
      </div>
    </section>

    <article class="article-content container">
      <div class="article-body">
        <aside class="article-author" aria-label="Article author and review information">
          <img src="/assets/tutor-services-logo.png" alt="Tutorservices Editorial Team logo" width="128" height="128" loading="lazy" decoding="async">
          <div><span class="section-kicker">Written by</span><h2>Tutorservices Editorial Team</h2><p>Prepared from common parent and student questions and reviewed for service accuracy. Tutor matching depends on class, subject, mode, location and availability.</p><div class="article-author-meta"><time datetime="${isoDate}">Last reviewed: ${localDate}</time><a href="/editorial-policy">Editorial Policy</a></div></div>
        </aside>
        <img class="article-cover" src="${imageUrl}" alt="${escapeHtml(article.imageAlt || article.h1)}" width="1200" height="750" loading="eager" decoding="async">
        ${(article.introParagraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("\n        ")}
        <div class="ai-summary-box"><span class="section-kicker">Quick Answer</span><h2>${escapeHtml(article.quickAnswer?.heading || article.h1)}</h2>${(article.quickAnswer?.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
        ${sectionHtml}
        ${tableHtml}
        <h2>Frequently Asked Questions</h2>
        ${faqHtml}
        <h2>Conclusion</h2>
        ${(article.conclusion || []).map((paragraph) => `<p>${paragraph}</p>`).join("\n        ")}
        <aside class="related-guides" aria-labelledby="related-guides-title"><h2 id="related-guides-title">Related Tutorservices links</h2><div class="related-guide-links"><a href="/services">Explore tuition services</a><a href="/about">About Tutorservices</a><a href="/contact">Contact Tutorservices</a><a href="/student-registration">Request a tutor</a><a href="/classes">Class-wise tuition</a><a href="/subjects">Subject-wise tuition</a></div></aside>
        <section aria-labelledby="next-step-title"><h2 id="next-step-title">Get Learning Support with Tutorservices</h2><p>Share the student's class, subject, board, preferred mode, timing and expected fee. Tutor matching depends on the exact requirement and tutor availability.</p><p><a class="btn btn-primary-custom" href="/student-registration">Request a Tutor</a> <a class="btn btn-outline-custom" href="https://www.tutorservices.in/contact.html">Contact Tutorservices</a></p></section>
      </div>
    </article>

    <section class="business-trust" aria-labelledby="business-trust-title"><div class="container"><h2 id="business-trust-title" class="visually-hidden">Tutorservices business information</h2><div class="business-trust-grid"><div><i class="fa-solid fa-user-shield" aria-hidden="true"></i><span><strong>Founder-led service</strong>Meenakshi Sharma</span></div><a href="tel:+917011090796"><i class="fa-solid fa-phone" aria-hidden="true"></i><span><strong>Call for enquiries</strong>+91 7011090796</span></a><a href="mailto:tutorservices.in@gmail.com"><i class="fa-solid fa-envelope" aria-hidden="true"></i><span><strong>Email support</strong>tutorservices.in@gmail.com</span></a><div><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span><strong>Service area</strong>Delhi NCR and ALL across India</span></div></div></div></section>
  </main>
  <footer class="site-footer"><div class="container"><div class="footer-bottom">&copy; 2026 Tutorservices. Learn Smarter, Achieve Faster. Contact: tutorservices.in@gmail.com</div></div></footer>
  <a class="sticky-whatsapp" href="https://wa.me/917011090796" aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a><a class="call-now" href="tel:+917011090796" aria-label="Call Tutorservices"><i class="fa-solid fa-phone"></i></a><button class="back-to-top" type="button" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button><script src="script.min.js"></script>
</body>
</html>
`;
}

function updateBlogIndex(articles) {
  const blogPath = path.join(root, "blog.html");
  let html = fs.readFileSync(blogPath, "utf8");

  const blogPostInsert = articles.map(({ topicInfo }) => `          {
            "@id": "https://www.tutorservices.in/${topicInfo.slug}#article"
          }`).join(",\n");

  html = html.replace(/("blogPost": \[\s*)/, `$1\n${blogPostInsert},\n`);

  const cardInsert = articles.map(({ topicInfo, article, imageUrl }) => `          <div class="col-md-6 col-lg-4 blog-item" data-title="${escapeHtml(`${topicInfo.primaryKeyword} ${topicInfo.topic} ${topicInfo.category}`)}">
            <article class="blog-card h-100">
              <img src="${imageUrl}" alt="${escapeHtml(article.imageAlt || article.h1)}" width="1200" height="750" loading="lazy" decoding="async">
              <div>
                <span>${escapeHtml(topicInfo.category)}</span>
                <h2>${escapeHtml(article.h1)}</h2>
                <p>${escapeHtml(article.metaDescription)}</p>
                <a href="/${topicInfo.slug}">Read full guide <i class="fa-solid fa-arrow-right ms-1"></i></a>
              </div>
            </article>
          </div>`).join("\n");

  html = html.replace(/(<div class="row g-4 blog-list">\s*)/, `$1\n${cardInsert}\n`);
  html = html.replace(/(<loc>https:\/\/www\.tutorservices\.in\/blog<\/loc>\s*<lastmod>)[^<]+/, `$1${isoDate}`);
  fs.writeFileSync(blogPath, html, "utf8");
}

function updateSitemap(articles) {
  const sitemapPath = path.join(root, "sitemap.xml");
  let xml = fs.readFileSync(sitemapPath, "utf8");
  const entries = articles.map(({ topicInfo }) => `  <url>
    <loc>https://www.tutorservices.in/${topicInfo.slug}</loc>
    <lastmod>${isoDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");
  xml = xml.replace("</urlset>", `${entries}\n</urlset>`);
  xml = xml.replace(/(<loc>https:\/\/www\.tutorservices\.in\/blog<\/loc>\s*<lastmod>)[^<]+/, `$1${isoDate}`);
  fs.writeFileSync(sitemapPath, xml, "utf8");
}

const generated = [];

for (const topicInfo of selectedTopics) {
  const article = await generateArticle(topicInfo);
  const imageUrl = await createBlogImage(topicInfo, article);
  const html = renderArticleHtml(topicInfo, article, imageUrl);
  const filePath = path.join(root, `${topicInfo.slug}.html`);
  fs.writeFileSync(filePath, html, "utf8");
  const wordCount = countWords(html);
  if (wordCount < 2000) {
    throw new Error(`${topicInfo.slug} generated too short: ${wordCount} words.`);
  }
  generated.push({ topicInfo, article, imageUrl, wordCount });
}

updateBlogIndex(generated);
updateSitemap(generated);

for (const { topicInfo, imageUrl, wordCount } of generated) {
  console.log(`${topicInfo.slug}|${topicInfo.primaryKeyword}|${imageUrl}|${wordCount}`);
}
