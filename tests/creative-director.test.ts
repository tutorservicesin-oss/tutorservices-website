import { describe, expect, it } from "vitest";
import { defaultCampaign } from "@/lib/campaign";
import { createCreativePlan, planCreativeFromPrompt } from "@/lib/ai/creative-director";

describe("creative director planning", () => {
  it("infers a structured TutorServices campaign from natural language", () => {
    const plan = planCreativeFromPrompt(
      "Create a premium Instagram ad for Class 10 Maths home tuition in Dwarka. Target parents. Make it trustworthy. Offer a free demo class.",
    );

    expect(plan.brief.campaign.subject).toBe("Maths");
    expect(plan.brief.campaign.audience).toBe("Parents");
    expect(plan.brief.campaign.location).toBe("Dwarka");
    expect(plan.brief.campaign.formatId).toBe("instagram-square");
    expect(plan.brief.campaign.styleId).toBe("premium-education");
    expect(plan.brief.campaign.headline).toBe("Master Class 10 Maths");
    expect(plan.brief.campaign.offer).toBe("FREE DEMO CLASS");
    expect(plan.directions).toHaveLength(4);
    expect(new Set(plan.directions.map((direction) => direction.composition.templateId)).size).toBeGreaterThan(1);
  });

  it("uses the current campaign when refining a numbered creative", () => {
    const plan = planCreativeFromPrompt("Make number 2 more premium.", defaultCampaign);

    expect(plan.mode).toBe("refine");
    expect(plan.brief.campaign.subject).toBe(defaultCampaign.subject);
    expect(plan.directions[1].composition.templateId).toBe("premium-minimal");
  });

  it("classifies targeted conversational refinements without regenerating all creatives in mock planning", async () => {
    const plan = await createCreativePlan(
      {
        prompt: "Keep this image, but make FREE DEMO CLASS much more prominent.",
        currentCampaign: defaultCampaign,
        selectedVariationId: "variation-2",
        currentVariations: [
          {
            id: "variation-1",
            title: "One",
            prompt: "one",
            backgroundUrl: "/demo-backgrounds/tutor-student.jpg",
            settings: { ...defaultCampaignSettings(), offerScale: 1 },
          },
          {
            id: "variation-2",
            title: "Two",
            prompt: "two",
            backgroundUrl: "/demo-backgrounds/exam-success.jpg",
            settings: { ...defaultCampaignSettings(), offerScale: 1 },
          },
        ],
      },
      { DEMO_MODE: "true" },
    );

    expect(plan.action?.kind).toBe("update_composition_only");
    expect(plan.action?.targetVariationId).toBe("variation-2");
    expect(plan.action?.requiresImageGeneration).toBe(false);
  });
});

function defaultCampaignSettings() {
  return {
    logoPosition: "top-left" as const,
    logoScale: 0.22,
    textPosition: "left" as const,
    fontScale: 1,
    fontWeight: "900" as const,
    templateId: "split-hero",
    overlayOpacity: 0.86,
    imagePosition: "right" as const,
    imageZoom: 1.18,
    focalX: 0.72,
    focalY: 0.48,
    offerScale: 1,
  };
}
