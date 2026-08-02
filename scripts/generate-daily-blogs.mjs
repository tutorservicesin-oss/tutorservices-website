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
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing.");
}

const model = process.env.OPENAI_DAILY_BLOG_MODEL || "gpt-5";

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
}

function createSvgImage(topicInfo, article) {
  const imageFileName = `${topicInfo.slug}-study-guide.svg`;
  const imagePath = path.join(root, "assets", "images", imageFileName);
  const title = escapeHtml(article.h1 || topicInfo.topic);
  const category = escapeHtml(topicInfo.category);
  const primary = escapeHtml(topicInfo.primaryKeyword);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">Original TutorServices educational blog image for ${primary}</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#050816"/>
      <stop offset="52%" stop-color="#0B1228"/>
      <stop offset="100%" stop-color="#101A35"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="48%" stop-color="#7B2FF7"/>
      <stop offset="100%" stop-color="#FF0080"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>
  <circle cx="1040" cy="130" r="120" fill="#00E5FF" opacity="0.08"/>
  <circle cx="150" cy="640" r="180" fill="#FF0080" opacity="0.08"/>
  <rect x="78" y="82" width="1044" height="586" rx="34" fill="#101A35" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>
  <rect x="118" y="122" width="260" height="58" rx="29" fill="url(#accent)"/>
  <text x="248" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#FFFFFF">${category}</text>
  <text x="118" y="265" font-family="Arial, sans-serif" font-size="58" font-weight="800" fill="#FFFFFF">TutorServices</text>
  <text x="118" y="326" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#00E5FF">${primary}</text>
  <foreignObject x="118" y="370" width="570" height="160">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #CBD5E1; font-size: 28px; line-height: 1.35; font-weight: 600;">${title}</div>
  </foreignObject>
  <g transform="translate(760 255)">
    <rect x="0" y="0" width="270" height="210" rx="24" fill="#0B1228" stroke="#00E5FF" stroke-opacity="0.42" stroke-width="3"/>
    <rect x="34" y="42" width="202" height="22" rx="11" fill="#00E5FF" opacity="0.95"/>
    <rect x="34" y="88" width="150" height="18" rx="9" fill="#CBD5E1" opacity="0.55"/>
    <rect x="34" y="128" width="188" height="18" rx="9" fill="#CBD5E1" opacity="0.35"/>
    <circle cx="226" cy="164" r="34" fill="#FF6B00"/>
    <path d="M210 164l12 12 24-31" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="118" y="610" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#94A3B8">Learn Smarter, Achieve Faster</text>
</svg>`;
  fs.writeFileSync(imagePath, svg, "utf8");
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
  const imageUrl = createSvgImage(topicInfo, article);
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
