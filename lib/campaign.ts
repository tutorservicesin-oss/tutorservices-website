import type { LogoPosition } from "@/lib/brand";
import { defaultBrandKit } from "@/lib/brand";
import type { CreativePlan } from "@/lib/ai/creative-director";
import type { CreativeCopy, CreativeDirectionPlan, StructuredCreativeBrief } from "@/lib/ai/schemas";
import { compositionTemplates, type TextPosition } from "@/lib/templates";

export const audienceOptions = [
  "Students",
  "Parents",
  "School Students",
  "College Students",
  "Exam Aspirants",
  "Working Professionals",
  "Custom",
] as const;

export const subjectOptions = [
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer Science",
  "Accounts",
  "Economics",
  "Home Tuition",
  "Online Tuition",
  "Competitive Exams",
  "Other",
] as const;

export type CampaignInput = {
  campaignName: string;
  advertising: string;
  headline: string;
  description: string;
  offer: string;
  cta: string;
  audience: string;
  customAudience: string;
  location: string;
  subject: string;
  customSubject: string;
  formatId: string;
  styleId: string;
};

export type CompositionSettings = {
  logoPosition: LogoPosition;
  logoScale: number;
  textPosition: TextPosition;
  fontScale: number;
  fontWeight: "700" | "800" | "900";
  templateId: string;
  overlayOpacity: number;
  imagePosition: "center" | "left" | "right";
  imageZoom: number;
  focalX: number;
  focalY: number;
  offerScale: number;
};

export type GeneratedVariation = {
  id: string;
  title: string;
  prompt: string;
  backgroundUrl: string;
  settings: CompositionSettings;
  originalUserPrompt?: string;
  creativeBrief?: StructuredCreativeBrief;
  creativeConcept?: CreativeDirectionPlan;
  imagePrompt?: string;
  generatedImage?: string;
  copy?: CreativeCopy;
  composition?: CompositionSettings;
  conversationHistory?: ChatMessage[];
  generationTimestamp?: string;
  provider?: string;
  model?: string;
  versionHistory?: GeneratedVariationVersion[];
};

export type GeneratedVariationVersion = {
  id: string;
  timestamp: string;
  reason: string;
  backgroundUrl: string;
  prompt: string;
  copy?: CreativeCopy;
  settings: CompositionSettings;
  provider?: string;
  model?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AdProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  campaign: CampaignInput;
  formatId: string;
  styleId: string;
  variations: GeneratedVariation[];
  creativePlan?: CreativePlan;
  messages?: ChatMessage[];
};

export const defaultCampaign: CampaignInput = {
  campaignName: "Class 10 Maths Home Tuition",
  advertising: "Expert Class 10 Maths Home Tuition",
  headline: "Master Class 10 Maths with Expert Tutors",
  description: "Personalized home tuition for better concepts, confidence and results.",
  offer: "Free Demo Class",
  cta: defaultBrandKit.defaultCta,
  audience: "Parents",
  customAudience: "",
  location: "Delhi",
  subject: "Maths",
  customSubject: "",
  formatId: "instagram-square",
  styleId: "premium-education",
};

export function createDefaultSettings(index: number): CompositionSettings {
  const generationTemplateIds = ["split-hero", "full-bleed-hero", "parent-trust", "subject-hero"];
  const template =
    compositionTemplates.find((item) => item.id === generationTemplateIds[index % generationTemplateIds.length]) ??
    compositionTemplates[index % compositionTemplates.length];

  return {
    logoPosition: template.defaultLogoPosition,
    logoScale: index === 1 ? 0.2 : 0.22,
    textPosition: template.textPosition,
    fontScale: 1,
    fontWeight: "900",
    templateId: template.id,
    overlayOpacity: template.defaultOverlayOpacity,
    imagePosition: template.defaultImagePosition,
    imageZoom: template.defaultImageZoom,
    focalX: template.defaultImagePosition === "right" ? 0.72 : template.defaultImagePosition === "left" ? 0.28 : 0.5,
    focalY: 0.48,
    offerScale: 1,
  };
}

export function getResolvedAudience(campaign: CampaignInput): string {
  return campaign.audience === "Custom" ? campaign.customAudience.trim() : campaign.audience;
}

export function getResolvedSubject(campaign: CampaignInput): string {
  return campaign.subject === "Other" ? campaign.customSubject.trim() : campaign.subject;
}

export function createCampaignCopy(seed: string, subject: string, location: string) {
  const topic = seed.trim() || `${subject} Tuition`;
  const place = location.trim() || "your area";

  return {
    headline: `Master ${topic} with Expert Tutors`,
    description: `Personalized tutoring in ${place} for stronger concepts, confidence and results.`,
    offer: "Free Demo Class",
    cta: "Book Now",
  };
}
