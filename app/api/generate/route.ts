import { NextResponse } from "next/server";
import type { CampaignInput, ChatMessage, GeneratedVariation } from "@/lib/campaign";
import { createCreativePlan, type CreativePlan } from "@/lib/ai/creative-director";
import { buildVariationRequests, buildVariationRequestsFromPlan } from "@/lib/ai/prompt-builder";
import { selectImageProvider } from "@/lib/ai/providers";
import { getAdFormat } from "@/lib/formats";
import { validateCampaign } from "@/lib/validation/campaign";

type GenerateBody =
  | CampaignInput
  | {
      prompt: string;
      currentCampaign?: CampaignInput;
      currentPlan?: CreativePlan;
      currentVariations?: GeneratedVariation[];
      selectedVariationId?: string;
      messages?: ChatMessage[];
    };

function isPromptBody(body: GenerateBody): body is Extract<GenerateBody, { prompt: string }> {
  return typeof (body as { prompt?: unknown }).prompt === "string";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const promptBody = isPromptBody(body) ? body : null;
    const plan: CreativePlan | null = promptBody
      ? await createCreativePlan({
          prompt: promptBody.prompt,
          currentCampaign: promptBody.currentCampaign,
          currentPlan: promptBody.currentPlan,
          currentVariations: promptBody.currentVariations,
          selectedVariationId: promptBody.selectedVariationId,
          messages: promptBody.messages,
        })
      : null;
    const campaign = plan?.brief.campaign ?? (body as CampaignInput);
    const validation = validateCampaign(campaign);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const format = getAdFormat(campaign.formatId);
    const providerStatus = selectImageProvider();

    if (plan?.action?.kind === "update_composition_only") {
      const updated = updateExistingVariationWithoutImage(plan, promptBody?.currentVariations ?? [], promptBody?.selectedVariationId);

      return NextResponse.json({
        provider: providerStatus.provider.id,
        providerStatus: {
          mode: providerStatus.mode,
          realAi: providerStatus.realAi,
          message: providerStatus.message,
          imageProvider: providerStatus.provider.label,
          imageModel: providerStatus.provider.model,
          creativeDirector: plan.provider,
          creativeDirectorModel: plan.model,
        },
        demoMode: providerStatus.demoMode,
        realAi: providerStatus.realAi && plan.realAi,
        message: "Updated the selected creative copy and composition without regenerating the image.",
        plan,
        campaign,
        variations: [updated],
        updateMode: "replace_variation",
        targetVariationId: updated.id,
        didRegenerateImages: false,
      });
    }

    const requests = plan ? buildVariationRequestsFromPlan(plan, format) : buildVariationRequests(campaign, format);
    const scopedRequests = plan?.action?.kind === "replace_variation" ? requests.slice(0, 1) : requests;
    const variations = await providerStatus.provider.generateVariations(scopedRequests);
    const targetVariation = plan?.action?.targetVariationId
      ? promptBody?.currentVariations?.find((variation: GeneratedVariation) => variation.id === plan.action?.targetVariationId)
      : undefined;
    const responseVariations =
      plan?.action?.kind === "replace_variation" && targetVariation && variations[0]
        ? [{ ...variations[0], id: targetVariation.id, versionHistory: createVersionHistory(targetVariation, plan.action.reason) }]
        : variations;

    return NextResponse.json({
      provider: providerStatus.provider.id,
      providerStatus: {
        mode: providerStatus.mode,
        realAi: providerStatus.realAi,
        message: providerStatus.message,
        imageProvider: providerStatus.provider.label,
        imageModel: providerStatus.provider.model,
        creativeDirector: plan?.provider ?? "mock",
        creativeDirectorModel: plan?.model,
      },
      demoMode: providerStatus.demoMode,
      realAi: providerStatus.realAi && (plan?.realAi ?? providerStatus.realAi),
      message: providerStatus.message,
      plan,
      campaign,
      variations: responseVariations,
      updateMode: plan?.action?.kind === "replace_variation" ? "replace_variation" : "new_set",
      targetVariationId: plan?.action?.targetVariationId ?? responseVariations[0]?.id,
      didRegenerateImages: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function updateExistingVariationWithoutImage(
  plan: CreativePlan,
  currentVariations: GeneratedVariation[],
  selectedVariationId?: string,
): GeneratedVariation {
  const targetId = plan.action?.targetVariationId ?? selectedVariationId;
  const target =
    currentVariations.find((variation) => variation.id === targetId) ??
    (plan.action?.targetVariationNumber ? currentVariations[plan.action.targetVariationNumber - 1] : undefined) ??
    currentVariations[0];
  const direction = plan.directions[0];

  if (!target || !direction) {
    throw new Error("No selected creative was available for a composition-only update.");
  }

  const settings = {
    ...target.settings,
    ...direction.composition,
    offerScale: Math.max(direction.composition.offerScale ?? target.settings.offerScale ?? 1, target.settings.offerScale ?? 1),
  };

  return {
    ...target,
    title: direction.title || target.title,
    prompt: target.prompt,
    settings,
    composition: settings,
    copy: direction.copy ?? target.copy,
    creativeBrief: plan.structuredBrief ?? target.creativeBrief,
    creativeConcept: direction.creativeConcept ?? target.creativeConcept,
    generationTimestamp: new Date().toISOString(),
    provider: target.provider,
    model: target.model,
    versionHistory: createVersionHistory(target, plan.action?.reason ?? "Composition-only refinement"),
  };
}

function createVersionHistory(variation: GeneratedVariation, reason: string) {
  return [
    ...(variation.versionHistory ?? []),
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      reason,
      backgroundUrl: variation.backgroundUrl,
      prompt: variation.prompt,
      copy: variation.copy,
      settings: variation.settings,
      provider: variation.provider,
      model: variation.model,
    },
  ];
}
