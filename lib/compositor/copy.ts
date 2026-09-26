import { getResolvedAudience, getResolvedSubject, type CampaignInput } from "@/lib/campaign";
import { defaultBrandKit } from "@/lib/brand";

export type NormalizedAdCopy = {
  headline: string;
  support: string;
  offer: string;
  cta: string;
  subject: string;
  audience: string;
  location: string;
  benefits: string[];
};

function titleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactHeadline(headline: string, subject: string): string {
  const cleaned = headline.trim().replace(/\s+/g, " ");

  if (cleaned.length <= 30) return titleCase(cleaned);

  const withoutSuffix = cleaned
    .replace(/\s+with\s+expert\s+(home\s+)?tutors?\.?$/i, "")
    .replace(/\s+for\s+better\s+results\.?$/i, "")
    .trim();

  if (withoutSuffix.length >= 12 && withoutSuffix.length <= 34) {
    return titleCase(withoutSuffix);
  }

  const subjectMatch = cleaned.match(/(class\s*\d+\s+[a-z]+|maths|science|physics|chemistry|biology|english|accounts|economics)/i);
  if (subjectMatch) {
    return titleCase(`Master ${subjectMatch[0]}`);
  }

  return titleCase(subject ? `Master ${subject}` : cleaned.slice(0, 34));
}

function compactSupport(description: string, headline: string): string {
  const cleaned = description.trim().replace(/\s+/g, " ");

  if (/expert/i.test(headline) && cleaned.length > 78) {
    return "Personalized classes for stronger concepts, confidence and results.";
  }

  if (cleaned.length <= 82) return cleaned;

  return `${cleaned.slice(0, 78).replace(/[,\s]+$/g, "")}.`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBenefits(campaign: CampaignInput): string[] {
  const subject = getResolvedSubject(campaign);
  const audience = getResolvedAudience(campaign);

  if (/exam|aspirant|class\s*10|class\s*12/i.test(`${campaign.advertising} ${subject} ${audience}`)) {
    return ["Exam Strategy", "Concept Clarity", "Result Focused"];
  }

  if (/parent/i.test(audience)) {
    return ["Verified Tutors", "Progress Updates", "Flexible Timing"];
  }

  if (/online/i.test(subject)) {
    return ["Live Online Classes", "Expert Tutors", "Flexible Timing"];
  }

  return ["Verified Tutors", "Personalized Classes", "Home & Online Tuition"];
}

export function normalizeAdCopy(campaign: CampaignInput): NormalizedAdCopy {
  const subject = titleCase(getResolvedSubject(campaign) || "Home Tuition");
  const audience = titleCase(getResolvedAudience(campaign) || "Students");
  const location = titleCase(campaign.location || "Delhi");
  const isTagline = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "") === defaultBrandKit.tagline.toLowerCase().replace(/[^a-z0-9]/g, "");
  const campaignHeadline = isTagline(campaign.headline)
    ? `Master ${campaign.advertising.match(/class\s*\d+\s+\w+/i)?.[0] || subject}`
    : campaign.headline;
  const headline = compactHeadline(campaignHeadline, subject);
  const supportFromHeadline = campaignHeadline.replace(new RegExp(escapeRegExp(headline), "i"), "").trim();
  const support =
    supportFromHeadline.length > 10 && !/^with\s+expert/i.test(supportFromHeadline)
      ? titleCase(supportFromHeadline)
      : compactSupport(isTagline(campaign.description) ? `Expert Tutors in ${location}` : campaign.description, campaignHeadline);

  return {
    headline,
    support,
    offer: campaign.offer.trim().replace(/\s+/g, " ").toUpperCase(),
    cta: campaign.cta.trim().replace(/\s+/g, " ").toUpperCase(),
    subject,
    audience,
    location,
    benefits: buildBenefits(campaign).slice(0, 3),
  };
}
