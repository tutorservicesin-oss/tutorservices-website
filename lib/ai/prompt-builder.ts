import type { CampaignInput } from "@/lib/campaign";
import { createDefaultSettings, getResolvedAudience, getResolvedSubject } from "@/lib/campaign";
import type { CreativePlan } from "@/lib/ai/creative-director";
import type { AdFormat } from "@/lib/formats";
import { getVisualStyle } from "@/lib/styles";
import { getCompositionTemplate } from "@/lib/templates";

const variationArtDirections = [
  {
    title: "Tutor and student interaction",
    scene:
      "A confident professional Indian tutor teaching a Class 10 student mathematics in a modern bright home study environment. Natural expressions, focused one-to-one learning, notebooks and laptop visible, aspirational but realistic.",
    mood: "trustworthy private tuition, warm commercial lighting, premium family education brand",
  },
  {
    title: "Student success and confidence",
    scene:
      "A confident Indian school student studying mathematics with organized notes, books, and a clean desk, showing calm exam confidence and progress. Contemporary Indian home or study room, polished photography.",
    mood: "motivational, high-achievement, optimistic, clean premium education advertising",
  },
  {
    title: "Parent trust consultation",
    scene:
      "An Indian parent and student speaking with a professional tutor about learning progress and goals. Friendly consultation, credible expressions, modern home study setting, premium tutoring service atmosphere.",
    mood: "parent confidence, safety, verified tutor trust, measured and professional",
  },
  {
    title: "Subject-focused premium education visual",
    scene:
      "Premium education scene for mathematics tuition with a student, tutor cues, notebook, formulas, laptop, and clean modern study environment. Strong subject focus without any readable text.",
    mood: "premium subject mastery, sharp academic confidence, high-converting social ad background",
  },
];

function getSubjectContext(subject: string, campaign: CampaignInput): string {
  if (/math/i.test(`${subject} ${campaign.advertising}`)) {
    return "mathematics notebook, geometry tools, equation practice, Class 10 board exam preparation";
  }

  if (/science|physics|chemistry|biology/i.test(subject)) {
    return "science learning materials, diagrams, lab-style study props, careful concept explanation";
  }

  if (/english|hindi/i.test(subject)) {
    return "language learning notebook, reading practice, conversation and grammar coaching cues";
  }

  return "school books, handwritten notes, laptop, whiteboard or study desk details";
}

export function buildImagePrompt(campaign: CampaignInput, format: AdFormat, variationIndex: number): string {
  const subject = getResolvedSubject(campaign);
  const audience = getResolvedAudience(campaign);
  const style = getVisualStyle(campaign.styleId);
  const settings = createDefaultSettings(variationIndex);
  const template = getCompositionTemplate(settings.templateId);
  const direction = variationArtDirections[variationIndex % variationArtDirections.length];

  return [
    "Premium Indian education advertising photography for TutorServices.",
    direction.scene,
    `Audience: ${audience || "Parents and school students"}. Location context: ${campaign.location || "Delhi"}.`,
    `Service context: ${campaign.advertising}. Subject cues: ${getSubjectContext(subject, campaign)}.`,
    `Art direction: ${direction.mood}. ${style.promptTone}.`,
    `Composition: ${format.width} x ${format.height} ${format.name}. Use a large human or education subject occupying roughly 35 to 60 percent of the canvas.`,
    `Template guidance: ${template.name}. Keep controlled negative space in the ${template.negativeSpace} for exact text overlay by the application.`,
    "Use tasteful blue and green accents compatible with TutorServices, but do not flood the whole image with brand colors.",
    "No text, no logos, no watermarks, no signs, no posters, no fake UI, no random symbols, no illegible typography.",
    "Do not render the headline, offer, CTA, phone number, website, or any marketing copy inside the image.",
  ].join(" ");
}

export function buildVariationRequests(campaign: CampaignInput, format: AdFormat) {
  return variationArtDirections.map((direction, index) => ({
    campaign,
    format,
    variationIndex: index,
    variationTitle: direction.title,
    prompt: buildImagePrompt(campaign, format, index),
  }));
}

export function buildVariationRequestsFromPlan(plan: CreativePlan, format: AdFormat) {
  return plan.directions.map((direction, index) => ({
    campaign: plan.brief.campaign,
    format,
    variationIndex: index,
    variationTitle: direction.title,
    compositionSettings: direction.composition,
    originalUserPrompt: plan.sourcePrompt,
    creativeBrief: plan.structuredBrief,
    creativeConcept: direction.creativeConcept,
    copy: direction.copy,
    prompt: [
      direction.imagePrompt ?? direction.imageDirection,
      `Structured creative brief: ${plan.brief.visualDirection}`,
      `Ad format: ${format.name}, ${format.width} x ${format.height}.`,
      `Copy safe area and composition intent: ${direction.concept}`,
      "Leave controlled negative space for exact application-rendered headline, supporting copy, offer, CTA, and TutorServices logo.",
      "No text, no logos, no watermarks, no signs, no posters, no fake UI, no random typography.",
    ].join(" "),
  }));
}
