const fs = require("fs");
const path = require("path");

console.log("Legacy WebP image optimization is disabled. Use restore-standard-images.py instead.");
process.exit(0);

const root = __dirname;
const excludedPages = new Set(["google4e98645dcf787467.html"]);
const htmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith(".html") && !excludedPages.has(file));

const oldHeroImage = "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=65";
const localPhotoVariants = {
  "photo-1577896851231-70ef18881754|1000": ["teacher-guiding-students-classroom.webp", "Teacher providing personalised guidance to students in a classroom", 1000, 750],
  "photo-1497633762265-9d179a990aa6|1200": ["home-tuition-study-guide.webp", "Student studying with books during a personalised home tuition session", 1200, 675],
  "photo-1497633762265-9d179a990aa6|700": ["student-reading-home-tuition.webp", "Student reading and revising lessons during home tuition", 700, 438],
  "photo-1522202176988-66273c2fd55f|1200": ["personalized-tuition-students-guide.webp", "Students learning together during a personalised tuition session", 1200, 675],
  "photo-1522202176988-66273c2fd55f|900": ["parent-student-tutor-study-plan.webp", "Parent and student discussing a personalised study plan with a tutor", 900, 600],
  "photo-1522202176988-66273c2fd55f|1000": ["students-learning-with-mentor.webp", "Students learning together with guidance from an experienced mentor", 1000, 750],
  "photo-1456513080510-7bf3a84b82f8|1200": ["class-10-board-exam-preparation-guide.webp", "Class 10 student preparing a structured study plan for board examinations", 1200, 675],
  "photo-1456513080510-7bf3a84b82f8|700": ["class-10-board-exam-study-plan.webp", "Student creating a revision timetable for Class 10 board examinations", 700, 438],
  "photo-1503676260728-1c00da094a0b|700": ["school-board-exam-students.webp", "School students preparing for CBSE, ICSE and State Board examinations", 700, 438],
  "photo-1513258496099-48168024aec0|700": ["effective-study-techniques-notebook.webp", "Study notebook showing planning techniques for active recall and revision", 700, 438],
  "photo-1515879218367-8466d910aaa4|700": ["coding-for-kids-computer-class.webp", "School student learning coding and practical computer skills", 700, 438],
  "photo-1543269865-cbf427effbad|1200": ["spoken-english-conversation-guide.webp", "Students developing spoken English fluency through guided conversation practice", 1200, 675],
  "photo-1543269865-cbf427effbad|700": ["students-practicing-spoken-english.webp", "Students practising spoken English and communication skills together", 700, 438],
  "photo-1551836022-d5d88e9218df|700": ["professional-home-tutor-registration.webp", "Professional educator registering for home and online tutoring opportunities", 700, 438],
  "photo-1554224155-8d04cb21cd6c|700": ["commerce-accounts-tuition-student.webp", "Commerce student studying accounts, economics and business notes", 700, 438],
  "photo-1596495578065-6e0763fa1178|1200": ["online-tuition-learning-guide.webp", "Student attending an interactive online tuition class on a laptop", 1200, 675],
  "photo-1596495578065-6e0763fa1178|700": ["student-attending-online-tuition.webp", "Student learning from an online tutor using a laptop at home", 700, 438],
  "photo-1594708767771-a7502209ff51|1000": ["delhi-home-tuition-service-areas.webp", "Delhi city view representing local home tuition service areas", 1000, 750],
  "photo-1588072432836-e10032774350|900": ["student-home-tuition-registration.webp", "Student studying with books and a laptop before a home tuition class", 1000, 750]
};

const localImageDetails = Object.fromEntries(
  Object.values(localPhotoVariants).map(([filename, alt, width, height]) => [
    `assets/images/${filename}`,
    { alt, width, height }
  ])
);

const socialImageMap = {
  "photo-1509062522246-3755977927d7": "assets/hero-students-1600.webp",
  "photo-1497633762265-9d179a990aa6": "assets/images/home-tuition-study-guide.webp",
  "photo-1522202176988-66273c2fd55f": "assets/images/personalized-tuition-students-guide.webp",
  "photo-1456513080510-7bf3a84b82f8": "assets/images/class-10-board-exam-preparation-guide.webp",
  "photo-1543269865-cbf427effbad": "assets/images/spoken-english-conversation-guide.webp",
  "photo-1596495578065-6e0763fa1178": "assets/images/online-tuition-learning-guide.webp"
};

function addPerformanceHints(html, file) {
  html = html.replace(/\s*<link rel="preconnect" href="https:\/\/images\.unsplash\.com" crossorigin>/gi, "");
  html = html.replace(new RegExp(`\\s*<link rel="preload" as="image" href="${oldHeroImage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" fetchpriority="high">`, "gi"), "");

  if (file === "index.html" && !html.includes('href="assets/hero-students-1600.webp"')) {
    html = html.replace(
      /(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>)/,
      `$1\n  <link rel="preload" as="image" href="assets/hero-students-900.webp" media="(max-width: 575px)" fetchpriority="high" type="image/webp">\n  <link rel="preload" as="image" href="assets/hero-students-1600.webp" media="(min-width: 576px)" fetchpriority="high" type="image/webp">`
    );
  }

  return html;
}

function deferAnalytics(html) {
  if (html.includes("function loadTutorservicesAnalytics")) return html;

  const analyticsPattern = /(?:<!-- Google tag \(gtag\.js\) -->\s*)?<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-KNFJRWMJHZ"><\/script>\s*<script>[\s\S]*?gtag\(['"]config['"],\s*['"]G-KNFJRWMJHZ['"]\);\s*<\/script>/i;
  const deferredAnalytics = `<!-- Deferred Google Analytics: loads after interaction or once the page is settled -->
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
  </script>`;

  return html.replace(analyticsPattern, deferredAnalytics);
}

function optimizeImages(html) {
  return html.replace(/<img\b([^>]*?)>/gi, (tag) => {
    let updated = tag.replace(/assets\/tutor-services-logo\.jpeg/g, "assets/tutor-services-logo.webp");
    const externalSource = updated.match(/src=["'](https?:\/\/images\.unsplash\.com\/[^"']+)["']/i)?.[1]?.replaceAll("&amp;", "&");
    if (externalSource) {
      const photoId = externalSource.match(/photo-[a-z0-9-]+/i)?.[0];
      const requestedWidth = externalSource.match(/[?&]w=(\d+)/i)?.[1];
      const replacement = localPhotoVariants[`${photoId}|${requestedWidth}`];
      if (replacement) updated = updated.replace(/src=["'][^"']+["']/i, `src="assets/images/${replacement[0]}"`);
    }

    const isLogo = /tutor-services-logo\.(?:jpeg|webp)/i.test(updated);
    const isArticleCover = /class=["'][^"']*article-cover/i.test(updated);
    const isRoundedMedia = /class=["'][^"']*rounded-media/i.test(updated);
    const isFeaturedBlog = /class=["'][^"']*rounded-4[^"']*w-100/i.test(updated);
    const localSource = updated.match(/src=["']([^"']+)["']/i)?.[1];
    const localDetails = localImageDetails[localSource];
    const isBlogCard = !isFeaturedBlog && (/[?&](?:amp;)?w=700\b/i.test(updated) || localDetails?.width === 700);

    const width = isLogo ? 128 : localDetails?.width || (isArticleCover ? 1200 : isRoundedMedia ? 1000 : isFeaturedBlog ? 900 : isBlogCard ? 700 : 1000);
    const height = isLogo ? 128 : localDetails?.height || (isArticleCover ? 675 : isRoundedMedia ? 750 : isFeaturedBlog ? 600 : isBlogCard ? 438 : 750);

    updated = updated.replace(/\s+width=["'][^"']+["']/i, "");
    updated = updated.replace(/\s+height=["'][^"']+["']/i, "");
    updated = updated.replace(/>$/, ` width="${width}" height="${height}">`);

    if (isLogo) {
      updated = updated.replace(/\s+alt=["'][^"']*["']/i, ' alt="Tutorservices home tuition and online tutoring logo"');
    } else if (localDetails) {
      updated = updated.replace(/\s+alt=["'][^"']*["']/i, ` alt="${localDetails.alt}"`);
    }

    if (isLogo) {
      if (!/\bloading=/i.test(updated)) updated = updated.replace(/>$/, ' loading="eager">');
      if (!/\bfetchpriority=/i.test(updated)) updated = updated.replace(/>$/, ' fetchpriority="high">');
      if (!/\bdecoding=/i.test(updated)) updated = updated.replace(/>$/, ' decoding="async">');
    } else {
      if (!/\bloading=/i.test(updated)) updated = updated.replace(/>$/, ' loading="lazy">');
      if (!/\bdecoding=/i.test(updated)) updated = updated.replace(/>$/, ' decoding="async">');
      updated = updated.replace(/([?&](?:amp;)?q=)80\b/g, "$165");
    }

    return updated;
  });
}

function localizeSocialImages(html) {
  return html.replace(/(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")([^"]+)(">)/gi, (tag, start, source, end) => {
    if (/assets\/tutor-services-logo\.jpeg/i.test(source)) {
      return `${start}https://www.tutorservices.in/assets/tutor-services-logo.webp${end}`;
    }
    const photoId = source.match(/photo-[a-z0-9-]+/i)?.[0];
    const localPath = socialImageMap[photoId];
    return localPath ? `${start}https://www.tutorservices.in/${localPath}${end}` : tag;
  });
}

for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  let html = fs.readFileSync(fullPath, "utf8");

  html = deferAnalytics(html);
  html = localizeSocialImages(html);
  html = html.replace(/\s*<link[^>]+unpkg\.com\/aos[^>]+>\s*/gi, "\n  ");
  html = html.replace(/\s*<script[^>]+unpkg\.com\/aos[^>]+><\/script>\s*/gi, "");
  html = html.replace(/\s*<script[^>]+cdn\.jsdelivr\.net\/npm\/bootstrap[^>]+><\/script>\s*/gi, "");
  html = html.replace(/<link href="https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.3\/dist\/css\/bootstrap\.min\.css" rel="stylesheet">/gi, '<link rel="stylesheet" href="vendor/bootstrap.min.css">');
  html = html.replace(/\s*<link href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.2\/css\/all\.min\.css" rel="stylesheet">/gi, "");
  html = html.replace(/\s*<link rel="preconnect" href="https:\/\/(?:cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)" crossorigin>/gi, "");
  html = html.replace(/<link rel="icon" href="assets\/tutor-services-logo\.jpeg">/gi, '<link rel="icon" type="image/png" href="assets/favicon.png">');
  html = html.replace(/<link rel="preload" as="style" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" onload="[^"]+"><noscript><link rel="stylesheet" href="[^"]+"><\/noscript>/gi, '<link href="$1" rel="stylesheet">');
  html = html.replace(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" media="print" onload="[^"]+"><noscript><link rel="stylesheet" href="[^"]+"><\/noscript>/gi, '<link href="$1" rel="stylesheet">');
  html = html.replace(/<link rel="preload" as="style" href="vendor\/bootstrap\.min\.css" onload="[^"]+"><noscript><link rel="stylesheet" href="vendor\/bootstrap\.min\.css"><\/noscript>/gi, '<link rel="stylesheet" href="vendor/bootstrap.min.css">');
  html = html.replace(/<link rel="preload" as="style" href="vendor\/bootstrap-[^"]+\.min\.css" onload="[^"]+"><noscript><link rel="stylesheet" href="vendor\/bootstrap-[^"]+\.min\.css"><\/noscript>/gi, (markup) => {
    const href = markup.match(/href="([^"]+)"/)?.[1];
    return href ? `<link rel="stylesheet" href="${href}">` : markup;
  });
  html = html.replace(/<link rel="preload" as="style" href="style(?:\.min)?\.css" onload="[^"]+"><noscript><link rel="stylesheet" href="style(?:\.min)?\.css"><\/noscript>/gi, '<link rel="stylesheet" href="style.min.css">');
  html = html.replace(/\s*<style id="critical-css">[\s\S]*?<\/style>\s*/gi, "\n  ");
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Montserrat[^"]+" rel="stylesheet">/gi, (fontLink) => {
    const href = fontLink.match(/href="([^"]+)"/i)?.[1]?.replace("display=swap", "display=optional");
    return href ? `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="${href}"></noscript>` : fontLink;
  });
  html = html.replace(/<link rel="stylesheet" href="vendor\/bootstrap(?:-[^"]+)?\.min\.css">/gi, '<link rel="stylesheet" href="layout.min.css">');
  html = html.replace(/<link rel="stylesheet" href="layout(?:\.min)?\.css">/gi, '<link rel="stylesheet" href="layout.min.css">');
  html = html.replace(/<link rel="stylesheet" href="style(?:\.min)?\.css">/gi, '<link rel="stylesheet" href="style.min.css">');
  html = html.replace(/<script src="script(?:\.min)?\.js"><\/script>/gi, '<script src="script.min.js"></script>');
  html = html.replace(/\s*<div id="loader"[^>]*>.*?<\/div>\s*/gis, "\n");
  html = addPerformanceHints(html, file);
  html = optimizeImages(html);

  fs.writeFileSync(fullPath, html, "utf8");
}

console.log(`Optimized ${htmlFiles.length} HTML pages.`);
