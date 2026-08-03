export default async function handler(request, response) {
  const authHeader = request.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const todayInIndia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  if (todayInIndia !== "2026-08-03") {
    return response.status(200).json({
      ok: true,
      skipped: true,
      message: "One-day 3 PM IST cron test has expired."
    });
  }

  if (!process.env.GH_TOKEN) {
    return response.status(500).json({ error: "GH_TOKEN is not configured." });
  }

  const githubResponse = await fetch(
    "https://api.github.com/repos/tutorservicesin-oss/tutorservices-website/actions/workflows/daily-blogs.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "TutorServices-Vercel-Cron-Test"
      },
      body: JSON.stringify({ ref: "main" })
    }
  );

  if (!githubResponse.ok) {
    const message = await githubResponse.text();
    return response.status(githubResponse.status).json({
      error: "GitHub workflow dispatch failed.",
      details: message
    });
  }

  return response.status(200).json({
    ok: true,
    message: "One-day 3 PM IST TutorServices blog workflow test triggered."
  });
}
