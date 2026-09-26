import type { CampaignInput, CompositionSettings } from "@/lib/campaign";

export type CreativeActionKind = "new_set" | "replace_variation" | "update_composition_only";

export type CreativeCopy = {
  headline: string;
  subheadline: string;
  offer: string;
  cta: string;
  benefits: string[];
};

export type CreativeDirectionPlan = {
  id: string;
  conceptName: string;
  artDirection: string;
  imagePrompt: string;
  copy: CreativeCopy;
  layoutIntent: string;
  subjectPlacement: "left" | "center" | "right" | "full-bleed";
  textSafeAreas: string[];
  composition: CompositionSettings;
};

export type StructuredCreativeBrief = {
  service: string;
  audience: string;
  location: string;
  platform: string;
  format: string;
  goal: string;
  tone: string[];
  offer: string;
  primaryMessage: string;
  headlineOptions: string[];
  cta: string;
  visualDirection: string;
  subjectDescription: string;
  compositionGuidance: string;
  negativePrompt: string[];
  campaign: CampaignInput;
};

export type CreativePlanAction = {
  kind: CreativeActionKind;
  targetVariationNumber: number | null;
  targetVariationId: string | null;
  requiresImageGeneration: boolean;
  preserveExistingImage: boolean;
  reason: string;
};

export type CreativePlanResponse = {
  action: CreativePlanAction;
  assistantMessage: string;
  brief: StructuredCreativeBrief;
  directions: CreativeDirectionPlan[];
};

type JsonSchema = Record<string, unknown>;

const stringArraySchema = {
  type: "array",
  items: { type: "string" },
};

const compositionSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "logoPosition",
    "logoScale",
    "textPosition",
    "fontScale",
    "fontWeight",
    "templateId",
    "overlayOpacity",
    "imagePosition",
    "imageZoom",
    "focalX",
    "focalY",
    "offerScale",
  ],
  properties: {
    logoPosition: { type: "string", enum: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] },
    logoScale: { type: "number" },
    textPosition: { type: "string", enum: ["left", "center", "right", "bottom"] },
    fontScale: { type: "number" },
    fontWeight: { type: "string", enum: ["700", "800", "900"] },
    templateId: {
      type: "string",
      enum: [
        "split-hero",
        "full-bleed-hero",
        "parent-trust",
        "exam-success",
        "premium-minimal",
        "results-benefits",
        "local-service",
        "subject-hero",
      ],
    },
    overlayOpacity: { type: "number" },
    imagePosition: { type: "string", enum: ["center", "left", "right"] },
    imageZoom: { type: "number" },
    focalX: { type: "number" },
    focalY: { type: "number" },
    offerScale: { type: "number" },
  },
};

const campaignSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "campaignName",
    "advertising",
    "headline",
    "description",
    "offer",
    "cta",
    "audience",
    "customAudience",
    "location",
    "subject",
    "customSubject",
    "formatId",
    "styleId",
  ],
  properties: {
    campaignName: { type: "string" },
    advertising: { type: "string" },
    headline: { type: "string" },
    description: { type: "string" },
    offer: { type: "string" },
    cta: { type: "string" },
    audience: { type: "string" },
    customAudience: { type: "string" },
    location: { type: "string" },
    subject: { type: "string" },
    customSubject: { type: "string" },
    formatId: { type: "string" },
    styleId: { type: "string" },
  },
};

export const creativePlanJsonSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["action", "assistantMessage", "brief", "directions"],
  properties: {
    action: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "targetVariationNumber", "targetVariationId", "requiresImageGeneration", "preserveExistingImage", "reason"],
      properties: {
        kind: { type: "string", enum: ["new_set", "replace_variation", "update_composition_only"] },
        targetVariationNumber: { type: ["number", "null"] },
        targetVariationId: { type: ["string", "null"] },
        requiresImageGeneration: { type: "boolean" },
        preserveExistingImage: { type: "boolean" },
        reason: { type: "string" },
      },
    },
    assistantMessage: { type: "string" },
    brief: {
      type: "object",
      additionalProperties: false,
      required: [
        "service",
        "audience",
        "location",
        "platform",
        "format",
        "goal",
        "tone",
        "offer",
        "primaryMessage",
        "headlineOptions",
        "cta",
        "visualDirection",
        "subjectDescription",
        "compositionGuidance",
        "negativePrompt",
        "campaign",
      ],
      properties: {
        service: { type: "string" },
        audience: { type: "string" },
        location: { type: "string" },
        platform: { type: "string" },
        format: { type: "string" },
        goal: { type: "string" },
        tone: stringArraySchema,
        offer: { type: "string" },
        primaryMessage: { type: "string" },
        headlineOptions: stringArraySchema,
        cta: { type: "string" },
        visualDirection: { type: "string" },
        subjectDescription: { type: "string" },
        compositionGuidance: { type: "string" },
        negativePrompt: stringArraySchema,
        campaign: campaignSchema,
      },
    },
    directions: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "conceptName",
          "artDirection",
          "imagePrompt",
          "copy",
          "layoutIntent",
          "subjectPlacement",
          "textSafeAreas",
          "composition",
        ],
        properties: {
          id: { type: "string" },
          conceptName: { type: "string" },
          artDirection: { type: "string" },
          imagePrompt: { type: "string" },
          copy: {
            type: "object",
            additionalProperties: false,
            required: ["headline", "subheadline", "offer", "cta", "benefits"],
            properties: {
              headline: { type: "string" },
              subheadline: { type: "string" },
              offer: { type: "string" },
              cta: { type: "string" },
              benefits: stringArraySchema,
            },
          },
          layoutIntent: { type: "string" },
          subjectPlacement: { type: "string", enum: ["left", "center", "right", "full-bleed"] },
          textSafeAreas: stringArraySchema,
          composition: compositionSchema,
        },
      },
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`Invalid creative plan: ${key} must be a string.`);
  return value;
}

function requireStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid creative plan: ${key} must be a string array.`);
  }
  return value;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid creative plan: ${key} must be a number.`);
  return value;
}

function validateComposition(value: unknown): CompositionSettings {
  if (!isRecord(value)) throw new Error("Invalid creative plan: composition is required.");
  return {
    logoPosition: requireString(value, "logoPosition") as CompositionSettings["logoPosition"],
    logoScale: requireNumber(value, "logoScale"),
    textPosition: requireString(value, "textPosition") as CompositionSettings["textPosition"],
    fontScale: requireNumber(value, "fontScale"),
    fontWeight: requireString(value, "fontWeight") as CompositionSettings["fontWeight"],
    templateId: requireString(value, "templateId"),
    overlayOpacity: requireNumber(value, "overlayOpacity"),
    imagePosition: requireString(value, "imagePosition") as CompositionSettings["imagePosition"],
    imageZoom: requireNumber(value, "imageZoom"),
    focalX: requireNumber(value, "focalX"),
    focalY: requireNumber(value, "focalY"),
    offerScale: requireNumber(value, "offerScale"),
  };
}

function validateCampaign(value: unknown): CampaignInput {
  if (!isRecord(value)) throw new Error("Invalid creative plan: campaign is required.");
  return {
    campaignName: requireString(value, "campaignName"),
    advertising: requireString(value, "advertising"),
    headline: requireString(value, "headline"),
    description: requireString(value, "description"),
    offer: requireString(value, "offer"),
    cta: requireString(value, "cta"),
    audience: requireString(value, "audience"),
    customAudience: requireString(value, "customAudience"),
    location: requireString(value, "location"),
    subject: requireString(value, "subject"),
    customSubject: requireString(value, "customSubject"),
    formatId: requireString(value, "formatId"),
    styleId: requireString(value, "styleId"),
  };
}

export function validateCreativePlanResponse(value: unknown): CreativePlanResponse {
  if (!isRecord(value)) throw new Error("Invalid creative plan response.");
  const action = value.action;
  const brief = value.brief;
  const directions = value.directions;
  if (!isRecord(action)) throw new Error("Invalid creative plan: action is required.");
  if (!isRecord(brief)) throw new Error("Invalid creative plan: brief is required.");
  if (!Array.isArray(directions) || directions.length < 1 || directions.length > 4) {
    throw new Error("Invalid creative plan: directions must contain 1 to 4 concepts.");
  }

  return {
    action: {
      kind: requireString(action, "kind") as CreativeActionKind,
      targetVariationNumber:
        typeof action.targetVariationNumber === "number" ? action.targetVariationNumber : null,
      targetVariationId: typeof action.targetVariationId === "string" ? action.targetVariationId : null,
      requiresImageGeneration: Boolean(action.requiresImageGeneration),
      preserveExistingImage: Boolean(action.preserveExistingImage),
      reason: requireString(action, "reason"),
    },
    assistantMessage: requireString(value, "assistantMessage"),
    brief: {
      service: requireString(brief, "service"),
      audience: requireString(brief, "audience"),
      location: requireString(brief, "location"),
      platform: requireString(brief, "platform"),
      format: requireString(brief, "format"),
      goal: requireString(brief, "goal"),
      tone: requireStringArray(brief, "tone"),
      offer: requireString(brief, "offer"),
      primaryMessage: requireString(brief, "primaryMessage"),
      headlineOptions: requireStringArray(brief, "headlineOptions"),
      cta: requireString(brief, "cta"),
      visualDirection: requireString(brief, "visualDirection"),
      subjectDescription: requireString(brief, "subjectDescription"),
      compositionGuidance: requireString(brief, "compositionGuidance"),
      negativePrompt: requireStringArray(brief, "negativePrompt"),
      campaign: validateCampaign(brief.campaign),
    },
    directions: directions.map((direction) => {
      if (!isRecord(direction)) throw new Error("Invalid creative plan: direction must be an object.");
      const copy = direction.copy;
      if (!isRecord(copy)) throw new Error("Invalid creative plan: direction copy is required.");
      return {
        id: requireString(direction, "id"),
        conceptName: requireString(direction, "conceptName"),
        artDirection: requireString(direction, "artDirection"),
        imagePrompt: requireString(direction, "imagePrompt"),
        copy: {
          headline: requireString(copy, "headline"),
          subheadline: requireString(copy, "subheadline"),
          offer: requireString(copy, "offer"),
          cta: requireString(copy, "cta"),
          benefits: requireStringArray(copy, "benefits").slice(0, 3),
        },
        layoutIntent: requireString(direction, "layoutIntent"),
        subjectPlacement: requireString(direction, "subjectPlacement") as CreativeDirectionPlan["subjectPlacement"],
        textSafeAreas: requireStringArray(direction, "textSafeAreas"),
        composition: validateComposition(direction.composition),
      };
    }),
  };
}
