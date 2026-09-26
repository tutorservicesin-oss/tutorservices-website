import {
  createDefaultSettings,
  defaultCampaign,
  type ChatMessage,
  type CampaignInput,
  type CompositionSettings,
  type GeneratedVariation,
} from "@/lib/campaign";
import { CREATIVE_DIRECTOR_SYSTEM_PROMPT, buildCreativeDirectorUserPrompt } from "@/lib/ai/prompts";
import {
  creativePlanJsonSchema,
  validateCreativePlanResponse,
  type CreativeCopy,
  type CreativeDirectionPlan,
  type CreativePlanAction,
  type CreativePlanResponse,
  type StructuredCreativeBrief,
} from "@/lib/ai/schemas";
import { getAdFormat } from "@/lib/formats";
import { getCompositionTemplate } from "@/lib/templates";

export type CreativeMode = "new" | "refine" | "restart";

export type CreativeBrief = {
  campaign: CampaignInput;
  objective: string;
  tone: string[];
  visualDirection: string;
  imageDirection: string;
  compositionRationale: string;
  offerEmphasis: "subtle" | "balanced" | "strong";
  notes: string[];
};

export type CreativeDirection = {
  id?: string;
  title: string;
  concept: string;
  imageDirection: string;
  composition: CompositionSettings;
  imagePrompt?: string;
  copy?: CreativeCopy;
  creativeConcept?: CreativeDirectionPlan;
};

export type CreativePlan = {
  mode: CreativeMode;
  sourcePrompt: string;
  assistantMessage: string;
  action?: CreativePlanAction;
  brief: CreativeBrief;
  directions: CreativeDirection[];
  structuredBrief?: StructuredCreativeBrief;
  provider?: "openai" | "ollama" | "mock";
  model?: string;
  realAi?: boolean;
};

type OpenAIResponseBody = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

type OllamaGenerateResponse = {
  response?: string;
  model?: string;
  done?: boolean;
};

type OpenAIErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

type CreativePlanInput = {
  prompt: string;
  currentCampaign?: CampaignInput;
  currentPlan?: CreativePlan;
  currentVariations?: GeneratedVariation[];
  selectedVariationId?: string;
  messages?: ChatMessage[];
};

const knownSubjects = [
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
];

const knownLocations = ["Dwarka", "Rohini", "Noida", "Gurgaon", "South Delhi", "Delhi"];

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function includesAny(prompt: string, values: string[]) {
  return values.some((value) => prompt.toLowerCase().includes(value.toLowerCase()));
}

function inferLocation(prompt: string, fallback = defaultCampaign.location) {
  const location = knownLocations.find((item) => prompt.toLowerCase().includes(item.toLowerCase()));
  if (location) return location;

  const match = prompt.match(/\bin\s+([a-z][a-z\s]{2,24})(?:\.|,|$)/i);
  return match ? titleCase(match[1]) : fallback;
}

function inferSubject(prompt: string, fallback = defaultCampaign.subject) {
  const subject = knownSubjects.find((item) => prompt.toLowerCase().includes(item.toLowerCase()));
  if (subject) return subject;
  if (/cbse/i.test(prompt)) return "Other";
  if (/home tutor|home tuition|tuition/i.test(prompt)) return fallback;
  return fallback;
}

function inferAudience(prompt: string, fallback = defaultCampaign.audience) {
  if (/parent|mother|father|guardian/i.test(prompt)) return "Parents";
  if (/college/i.test(prompt)) return "College Students";
  if (/working professional/i.test(prompt)) return "Working Professionals";
  if (/exam|board|neet|jee|cuet|aspirant/i.test(prompt)) return "Exam Aspirants";
  if (/student|school/i.test(prompt)) return "School Students";
  return fallback;
}

function inferFormat(prompt: string, fallback = defaultCampaign.formatId) {
  if (/story|whatsapp status|status/i.test(prompt)) return "instagram-story";
  if (/portrait|reel/i.test(prompt)) return "instagram-portrait";
  if (/youtube|thumbnail/i.test(prompt)) return "youtube-thumbnail";
  if (/landscape|facebook|google display/i.test(prompt)) return "facebook-landscape";
  if (/banner|website/i.test(prompt)) return "website-banner";
  if (/instagram|square/i.test(prompt)) return "instagram-square";
  return fallback;
}

function inferStyle(prompt: string, fallback = defaultCampaign.styleId) {
  if (/premium|aspirational|luxury|high[-\s]?end/i.test(prompt)) return "premium-education";
  if (/parent|trust|safe|verified/i.test(prompt)) return "parent-focused";
  if (/exam|urgent|board|score|result/i.test(prompt)) return "exam-preparation";
  if (/minimal|simple|clean/i.test(prompt)) return "minimal";
  if (/corporate|professional/i.test(prompt)) return "professional";
  if (/bright|friendly|colorful/i.test(prompt)) return "bright-friendly";
  if (/photo|realistic/i.test(prompt)) return "photorealistic";
  return fallback;
}

function inferTone(prompt: string, styleId: string) {
  const tones = new Set<string>();
  if (/premium|aspirational|luxury|high[-\s]?end/i.test(prompt) || styleId === "premium-education") tones.add("premium");
  if (/trust|parent|verified|safe/i.test(prompt)) tones.add("trustworthy");
  if (/urgent|limited|now/i.test(prompt)) tones.add("urgent");
  if (/emotional|confidence|future|dream/i.test(prompt)) tones.add("emotional");
  if (/modern|clean|contemporary/i.test(prompt)) tones.add("modern");
  if (/less corporate|friendly|warm/i.test(prompt)) tones.add("warm");
  if (tones.size === 0) {
    tones.add("modern");
    tones.add("trustworthy");
  }
  return Array.from(tones);
}

function inferOffer(prompt: string, fallback = defaultCampaign.offer) {
  if (/free demo/i.test(prompt)) return "FREE DEMO CLASS";
  if (/demo/i.test(prompt)) return "FREE DEMO CLASS";
  if (/discount|off/i.test(prompt)) return "LIMITED OFFER";
  return fallback.toUpperCase();
}

function inferCta(prompt: string, offer: string) {
  if (/find a tutor/i.test(prompt)) return "FIND A TUTOR";
  if (/start learning/i.test(prompt)) return "START LEARNING";
  if (/book/i.test(prompt) && /demo/i.test(prompt)) return "BOOK FREE DEMO";
  if (/demo/i.test(offer)) return "BOOK FREE DEMO";
  return "BOOK NOW";
}

function inferService(prompt: string) {
  if (/online/i.test(prompt)) return "Online Tuition";
  if (/home tutor|home tuition|home tutors/i.test(prompt)) return "Home Tuition";
  if (/cbse/i.test(prompt)) return "CBSE Tutors";
  if (/physics|maths|science|chemistry|biology|english|hindi|accounts|economics/i.test(prompt)) return "Tuition";
  return "Home Tuition";
}

function inferClassLevel(prompt: string) {
  const range = prompt.match(/class(?:es)?\s*(\d+)\s*(?:to|-)\s*(\d+)/i);
  if (range) return `Classes ${range[1]}-${range[2]}`;
  const single = prompt.match(/class\s*(\d+)/i);
  if (single) return `Class ${single[1]}`;
  return "";
}

function buildHeadline(subject: string, service: string, classLevel: string, prompt: string) {
  if (/stronger headline|more urgent/i.test(prompt)) {
    return classLevel && subject ? `${classLevel} ${subject} Success Starts Here` : "Get Expert Tuition Today";
  }
  if (subject === "Other" && /cbse/i.test(prompt)) return "Find Trusted CBSE Tutors";
  if (classLevel && subject) return `Master ${classLevel} ${subject}`;
  if (subject && service === "Home Tuition") return `Expert ${subject} Home Tutors`;
  if (subject) return `Master ${subject}`;
  return "Learn Smarter, Achieve Faster";
}

function buildSupport(subject: string, service: string, location: string, classLevel: string, audience: string, prompt: string) {
  if (/emotional/i.test(prompt)) return "Build confidence with patient expert guidance.";
  if (/urgent/i.test(prompt)) return `Book trusted ${service.toLowerCase()} in ${location} today.`;
  if (audience === "Parents") return `Expert ${service} in ${location} for confident learning.`;
  if (classLevel && subject) return `Personalized ${subject} support with expert tutors.`;
  return `Personalized learning support in ${location}.`;
}

function applyInstructionToCampaign(prompt: string, base: CampaignInput): CampaignInput {
  const subject = inferSubject(prompt, base.subject);
  const location = inferLocation(prompt, base.location);
  const audience = inferAudience(prompt, base.audience);
  const formatId = inferFormat(prompt, base.formatId);
  const styleId = inferStyle(prompt, base.styleId);
  const offer = inferOffer(prompt, base.offer);
  const cta = inferCta(prompt, offer);
  const service = inferService(prompt);
  const classLevel = inferClassLevel(prompt);
  const subjectLabel = subject === "Other" ? (base.customSubject || "CBSE") : subject;
  const headline = /change the headline/i.test(prompt) ? buildHeadline(subjectLabel, service, classLevel, prompt) : buildHeadline(subjectLabel, service, classLevel, prompt);
  const description = buildSupport(subjectLabel, service, location, classLevel, audience, prompt);
  const campaignName = [classLevel, subjectLabel, service, location].filter(Boolean).join(" ").replace(/\s+/g, " ");

  return {
    ...base,
    campaignName: campaignName || base.campaignName,
    advertising: campaignName || base.advertising,
    headline,
    description,
    offer,
    cta,
    audience,
    customAudience: audience === "Custom" ? base.customAudience : "",
    location,
    subject,
    customSubject: subject === "Other" ? "CBSE Tutors" : "",
    formatId,
    styleId,
  };
}

function tuneSettings(index: number, prompt: string): CompositionSettings {
  const settings = createDefaultSettings(index);
  if (/number\s*2|#2|ad\s*2/i.test(prompt) && index === 1 && /premium/i.test(prompt)) {
    return {
      ...settings,
      templateId: "premium-minimal",
      textPosition: "left",
      logoPosition: "top-left",
      imagePosition: "center",
      imageZoom: 1.22,
      focalX: 0.62,
      overlayOpacity: 0.76,
    };
  }
  if (/dark background/i.test(prompt)) return { ...settings, templateId: "full-bleed-hero", textPosition: "bottom", overlayOpacity: 0.82 };
  if (/offer.*prominent|prominent.*offer|urgent|free demo/i.test(prompt)) {
    return { ...settings, overlayOpacity: Math.max(settings.overlayOpacity, 0.86), offerScale: 1.35 };
  }
  if (/completely different|start over|new concept/i.test(prompt)) return createDefaultSettings(index + 3);
  return settings;
}

function buildDirections(campaign: CampaignInput, prompt: string): CreativeDirection[] {
  const subject = campaign.subject === "Other" ? campaign.customSubject || "CBSE" : campaign.subject;
  const location = campaign.location || "Delhi";
  const classLevel = inferClassLevel(`${campaign.campaignName} ${campaign.advertising}`);
  const format = getAdFormat(campaign.formatId);

  const concepts = [
    {
      title: "Tutor + Student Direction",
      concept: "One-to-one expert guidance in a modern home-learning scene.",
      imageDirection: `Premium Indian tutoring photography. A professional tutor teaching ${classLevel || "a school student"} ${subject} at home in ${location}. Warm trust, focused learning, large human subjects on the right, clean negative space for exact copy. No text or logos.`,
    },
    {
      title: "Student Confidence Direction",
      concept: "A student-forward success ad built around confidence and progress.",
      imageDirection: `A confident Indian school student studying ${subject}, organized notes and modern desk, aspirational academic mood, polished social-media ad lighting, ${format.name} crop, no readable text or logos.`,
    },
    {
      title: "Parent Trust Direction",
      concept: "Parent decision-making and TutorServices credibility.",
      imageDirection: `Indian parent and child consulting a professional tutor about ${subject} tuition in ${location}. Trustworthy expressions, premium modern home study room, parent-focused education marketing, no text or logos.`,
    },
    {
      title: "Subject Hero Direction",
      concept: "Subject mastery with a bolder performance-focused visual.",
      imageDirection: `Premium ${subject} tuition concept for Indian school education. Student, tutor cues, notebooks, laptop, mathematics practice and success energy, strong negative space for a large headline, no text or logos.`,
    },
  ];

  return concepts.map((item, index) => ({
    ...item,
    composition: tuneSettings(index, prompt),
  }));
}

function buildAssistantMessage(brief: CreativeBrief, directions: CreativeDirection[]) {
  const campaign = brief.campaign;
  const focus = [
    campaign.headline,
    campaign.description,
    campaign.offer,
    campaign.cta,
  ];
  return [
    "I understand.",
    `I'll create a ${brief.tone.join(", ")} TutorServices ad for ${campaign.advertising} targeting ${campaign.audience.toLowerCase()} in ${campaign.location}.`,
    "I'll emphasize:",
    ...focus.map((item) => `- ${item}`),
    `Generating ${directions.length} creative directions with distinct art direction and app-rendered ad copy.`,
  ].join("\n");
}

export function planCreativeFromPrompt(prompt: string, currentCampaign?: CampaignInput): CreativePlan {
  const base = currentCampaign ?? defaultCampaign;
  const mode: CreativeMode = /completely different|start over|new concept/i.test(prompt)
    ? "restart"
    : currentCampaign
      ? "refine"
      : "new";
  const campaign = applyInstructionToCampaign(prompt, base);
  const tone = inferTone(prompt, campaign.styleId);
  const directions = buildDirections(campaign, prompt);
  const templateNames = directions.map((direction) => getCompositionTemplate(direction.composition.templateId).name);
  const brief: CreativeBrief = {
    campaign,
    objective: includesAny(prompt, ["lead", "demo", "book", "enquiry"]) ? "Lead generation" : "Awareness and enquiry generation",
    tone,
    visualDirection: tone.includes("premium")
      ? "Premium Indian education advertising with polished photography, trust, and aspirational academic progress."
      : "Modern Indian tutoring advertising with clear subject value, human learning moments, and confident brand accents.",
    imageDirection: directions.map((direction) => direction.imageDirection).join(" "),
    compositionRationale: `Use ${templateNames.join(", ")} so each option has a different visual hierarchy while the compositor controls exact text.`,
    offerEmphasis: /free|urgent|offer|demo/i.test(prompt) ? "strong" : "balanced",
    notes: [
      "Marketing copy is rendered by the application compositor, not baked into the image.",
      "TutorServices logo is applied automatically from the brand kit.",
      "Templates are selected as fallback composition systems after the creative brief is inferred.",
    ],
  };

  return {
    mode,
    sourcePrompt: prompt,
    assistantMessage: buildAssistantMessage(brief, directions),
    brief,
    directions,
  };
}

export async function createCreativePlan(
  input: CreativePlanInput,
  env: Record<string, string | undefined> = process.env,
): Promise<CreativePlan> {
  const directorProvider = (env.CREATIVE_DIRECTOR_PROVIDER ?? env.AI_PROVIDER ?? "").toLowerCase();
  const shouldUseOllama = directorProvider === "ollama" || directorProvider === "local";
  const shouldUseMock =
    env.CREATIVE_DIRECTOR_PROVIDER === "mock" ||
    env.AI_PROVIDER === "mock" ||
    env.DEMO_MODE === "true";

  if (shouldUseMock) {
    return decorateMockPlan(input);
  }

  if (shouldUseOllama) {
    return createOllamaCreativePlan(input, env);
  }

  if (!env.OPENAI_API_KEY) {
    return decorateMockPlan(input);
  }

  const model = env.OPENAI_TEXT_MODEL ?? "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: CREATIVE_DIRECTOR_SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildCreativeDirectorUserPrompt(input) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tutorservices_creative_plan",
          strict: true,
          schema: creativePlanJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI creative director failed: ${await safeOpenAIError(response)}.`);
  }

  const data = (await response.json()) as OpenAIResponseBody;
  const text = extractOutputText(data);
  const parsed = JSON.parse(text) as unknown;
  const structured = normalizeCreativePlanResponse(validateCreativePlanResponse(parsed), input);

  return mapStructuredResponseToPlan(structured, input.prompt, "openai", model, true);
}

async function createOllamaCreativePlan(
  input: CreativePlanInput,
  env: Record<string, string | undefined>,
): Promise<CreativePlan> {
  const model = env.OLLAMA_TEXT_MODEL ?? "llama3.2";
  const baseUrl = env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: CREATIVE_DIRECTOR_SYSTEM_PROMPT,
      prompt: [
        "Return only JSON matching the provided schema. Do not include markdown.",
        "JSON schema:",
        JSON.stringify(creativePlanJsonSchema),
        "Creative request context:",
        buildCreativeDirectorUserPrompt(input),
      ].join("\n\n"),
      stream: false,
      format: creativePlanJsonSchema,
      keep_alive: env.OLLAMA_KEEP_ALIVE ?? "10m",
      options: {
        temperature: 0.35,
        num_ctx: Number(env.OLLAMA_NUM_CTX ?? 8192),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama creative director failed with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  if (!data.response) {
    throw new Error("Ollama creative director returned no structured output.");
  }

  const parsed = JSON.parse(data.response) as unknown;
  const structured = normalizeCreativePlanResponse(validateCreativePlanResponse(parsed), input);

  return mapStructuredResponseToPlan(structured, input.prompt, "ollama", model, true);
}

function decorateMockPlan(input: CreativePlanInput): CreativePlan {
  const mock = planCreativeFromPrompt(input.prompt, input.currentCampaign);
  const targeted = getTargetVariationNumber(input.prompt);
  const copyOnly = /keep (this|the) image|do not regenerate|don't regenerate|copy only|make .*offer.*prominent|offer.*more prominent/i.test(input.prompt);
  const fullRestart = /completely different|start over|new concept/i.test(input.prompt);

  return {
    ...mock,
    action: {
      kind: fullRestart ? "new_set" : targeted || input.selectedVariationId ? (copyOnly ? "update_composition_only" : "replace_variation") : "new_set",
      targetVariationNumber: targeted,
      targetVariationId: targeted ? input.currentVariations?.[targeted - 1]?.id ?? null : input.selectedVariationId ?? null,
      requiresImageGeneration: !(copyOnly && (targeted || input.selectedVariationId)),
      preserveExistingImage: copyOnly,
      reason: "Mock creative planning fallback.",
    },
    provider: "mock",
    model: "deterministic-mock-planner",
    realAi: false,
  };
}

function mapStructuredResponseToPlan(
  response: CreativePlanResponse,
  sourcePrompt: string,
  provider: "openai" | "ollama" | "mock",
  model: string,
  realAi: boolean,
): CreativePlan {
  const directions = response.directions.map((direction) => ({
    id: direction.id,
    title: direction.conceptName,
    concept: direction.artDirection,
    imageDirection: direction.imagePrompt,
    composition: direction.composition,
    imagePrompt: direction.imagePrompt,
    copy: direction.copy,
    creativeConcept: direction,
  }));

  return {
    mode:
      response.action.kind === "new_set"
        ? "new"
        : response.action.kind === "replace_variation"
          ? "refine"
          : "refine",
    sourcePrompt,
    assistantMessage: response.assistantMessage,
    action: response.action,
    brief: {
      campaign: response.brief.campaign,
      objective: response.brief.goal,
      tone: response.brief.tone,
      visualDirection: response.brief.visualDirection,
      imageDirection: directions.map((direction) => direction.imageDirection).join(" "),
      compositionRationale: response.brief.compositionGuidance,
      offerEmphasis: response.directions.some((direction) => direction.composition.offerScale > 1.18) ? "strong" : "balanced",
      notes: [
        response.brief.primaryMessage,
        "OpenAI creates the structured brief and art direction; the app compositor renders exact TutorServices text and logo.",
      ],
    },
    directions,
    structuredBrief: response.brief,
    provider,
    model,
    realAi,
  };
}

function normalizeCreativePlanResponse(response: CreativePlanResponse, input: CreativePlanInput): CreativePlanResponse {
  const kind = response.action.kind;
  const targetNumber = response.action.targetVariationNumber ?? getTargetVariationNumber(input.prompt);
  const targetVariationId =
    response.action.targetVariationId ??
    (targetNumber ? input.currentVariations?.[targetNumber - 1]?.id : input.selectedVariationId) ??
    null;
  const directionLimit = kind === "new_set" ? 4 : 1;
  const directions = response.directions.slice(0, directionLimit).map((direction, index) => ({
    ...direction,
    id: direction.id || `concept-${index + 1}`,
    composition: clampComposition(direction.composition),
    copy: {
      ...direction.copy,
      benefits: direction.copy.benefits.slice(0, 3),
    },
  }));
  const campaign = {
    ...response.brief.campaign,
    headline: directions[0]?.copy.headline || response.brief.campaign.headline,
    description: directions[0]?.copy.subheadline || response.brief.campaign.description,
    offer: directions[0]?.copy.offer || response.brief.offer,
    cta: directions[0]?.copy.cta || response.brief.cta,
  };

  return {
    ...response,
    action: {
      ...response.action,
      targetVariationNumber: targetNumber ?? null,
      targetVariationId,
    },
    brief: {
      ...response.brief,
      campaign,
    },
    directions,
  };
}

function clampComposition(settings: CompositionSettings): CompositionSettings {
  return {
    ...settings,
    logoScale: clamp(settings.logoScale, 0.18, 0.28),
    fontScale: clamp(settings.fontScale, 0.88, 1.22),
    overlayOpacity: clamp(settings.overlayOpacity, 0.5, 0.92),
    imageZoom: clamp(settings.imageZoom, 1.02, 1.5),
    focalX: clamp(settings.focalX, 0.15, 0.85),
    focalY: clamp(settings.focalY, 0.15, 0.85),
    offerScale: clamp(settings.offerScale, 1, 1.65),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function extractOutputText(data: OpenAIResponseBody) {
  if (data.output_text) return data.output_text;

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((value): value is string => Boolean(value))
    .join("");

  if (!text) throw new Error("OpenAI creative director returned no structured output.");
  return text;
}

async function safeOpenAIError(response: Response) {
  try {
    const data = (await response.json()) as OpenAIErrorBody;
    return data.error?.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

function getTargetVariationNumber(prompt: string) {
  const match = prompt.match(/\b(?:number|#|ad|creative|variation)\s*(\d)\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  return value >= 1 && value <= 4 ? value : null;
}
