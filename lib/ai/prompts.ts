import { defaultBrandKit } from "@/lib/brand";
import type { CampaignInput, ChatMessage, GeneratedVariation } from "@/lib/campaign";
import { adFormats } from "@/lib/formats";
import { visualStyles } from "@/lib/styles";
import { compositionTemplates } from "@/lib/templates";
import type { CreativePlan } from "@/lib/ai/creative-director";

type CreativeDirectorPromptInput = {
  prompt: string;
  currentCampaign?: CampaignInput;
  currentPlan?: CreativePlan;
  currentVariations?: GeneratedVariation[];
  selectedVariationId?: string;
  messages?: ChatMessage[];
};

const providerRules = [
  "You are the AI creative director and copywriter for TutorServices AI Ad Studio.",
  "Turn natural user language into a structured advertising brief and concrete creative directions.",
  "TutorServices is an Indian tutoring/home tuition brand. Brand name: TutorServices. Tagline: Learn Smarter, Achieve Faster.",
  "The official logo and all marketing text are added later by the application compositor.",
  "Image prompts must ask for only visual/background/people/environment. Never ask the image model to render logos, headlines, CTAs, offers, posters, signage, readable text, fake UI, or watermarks.",
  "Prefer premium realistic Indian education advertising photography unless the user clearly asks for another style.",
  "For a new request, return exactly four genuinely different creative directions.",
  "For a targeted refinement like 'Make number 2 more premium', update only that variation and return one direction.",
  "For 'keep this image' or copy/layout-only instructions, set kind to update_composition_only, preserveExistingImage true, requiresImageGeneration false, and return one updated direction.",
  "For visual subject changes, tutor gender/age changes, new concept, lighting/background changes, set requiresImageGeneration true.",
  "For offer, CTA, copy prominence, font hierarchy, or layout emphasis only, do not regenerate the image unless the user explicitly asks for a new visual.",
  "Use concise mobile-readable ad copy. Do not cram long service descriptions into the headline.",
  "Write a campaign-specific benefit headline, such as Master Class 10 Maths With the Right Tutor. Never use the brand tagline as the campaign headline unless explicitly requested. Do not repeat the tagline in supporting copy.",
  "For realistic tutoring photography, use at most two people: one tutor and one student. Prefer an eye-level medium shot with distinct faces, simple posture and a quiet home interior. Avoid groups and complex hand interactions. Put subjects and negative space according to the layout intent. Keep image prompts concise with the subject and placement first.",
  "Each imagePrompt must describe a single photograph in at most 50 words. Lead with the people's ages and placement, then one simple action, room and lighting. Do not include brand names, platform names, aspect-ratio numbers or layout jargon inside imagePrompt. Never request collages, panels, contact sheets or split screens. A Class 10 student is around 15-16 years old; the adult tutor must look distinctly older.",
  "Make the offer and CTA strong enough for a paid social ad.",
  "Use templates only as compositor layout intents. They are not the creative idea.",
].join("\n");

export const CREATIVE_DIRECTOR_SYSTEM_PROMPT = [
  providerRules,
  "",
  "Allowed campaign format ids:",
  adFormats.map((format) => `- ${format.id}: ${format.name}, ${format.width}x${format.height}`).join("\n"),
  "",
  "Allowed style ids:",
  visualStyles.map((style) => `- ${style.id}: ${style.name}`).join("\n"),
  "",
  "Allowed compositor template ids:",
  compositionTemplates.map((template) => `- ${template.id}: ${template.name}, text ${template.textPosition}, negative space ${template.negativeSpace}`).join("\n"),
  "",
  "Composition value guidance:",
  "- logoScale: 0.18 to 0.28",
  "- fontScale: 0.9 to 1.2",
  "- overlayOpacity: 0.55 to 0.92",
  "- imageZoom: 1.05 to 1.45",
  "- focalX/focalY: 0.15 to 0.85",
  "- offerScale: 1.0 normally, 1.25 to 1.6 when the offer should be very prominent",
].join("\n");

function compactVariation(variation: GeneratedVariation, index: number) {
  return {
    number: index + 1,
    id: variation.id,
    title: variation.title,
    prompt: variation.prompt,
    copy: variation.copy,
    settings: variation.settings,
    creativeConcept: variation.creativeConcept
      ? {
          id: variation.creativeConcept.id,
          conceptName: variation.creativeConcept.conceptName,
          artDirection: variation.creativeConcept.artDirection,
          layoutIntent: variation.creativeConcept.layoutIntent,
          subjectPlacement: variation.creativeConcept.subjectPlacement,
        }
      : undefined,
    hasGeneratedImage: Boolean(variation.backgroundUrl),
  };
}

export function buildCreativeDirectorUserPrompt(input: CreativeDirectorPromptInput) {
  const selectedVariation = input.currentVariations?.find((variation) => variation.id === input.selectedVariationId);

  return JSON.stringify(
    {
      userRequest: input.prompt,
      brand: {
        name: defaultBrandKit.name,
        tagline: defaultBrandKit.tagline,
        colors: defaultBrandKit.colors,
        defaultCta: defaultBrandKit.defaultCta,
      },
      currentCampaign: input.currentCampaign,
      currentBrief: input.currentPlan?.brief,
      currentDirections: input.currentPlan?.directions,
      selectedVariationId: input.selectedVariationId,
      selectedVariation: selectedVariation
        ? compactVariation(selectedVariation, input.currentVariations?.findIndex((variation) => variation.id === selectedVariation.id) ?? 0)
        : undefined,
      currentVariations: input.currentVariations?.map(compactVariation),
      conversationHistory: input.messages?.slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
      })),
      instructions: [
        "Infer all missing campaign fields from the user request and conversation history.",
        "Use instagram-square for Instagram ads unless the user requests portrait/story/reel/landscape/banner/YouTube/WhatsApp.",
        "If the user references a creative by number, set targetVariationNumber accordingly.",
        "If the user references the selected creative without a number, target selectedVariationId.",
        "Return short, punchy ad copy in copy and brief.campaign.",
        "Every imagePrompt must end with strong no-text/no-logo constraints.",
      ],
    },
    null,
    2,
  );
}
