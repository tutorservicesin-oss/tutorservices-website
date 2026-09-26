import type { CampaignInput, GeneratedVariation } from "@/lib/campaign";
import { createDefaultSettings, type CompositionSettings } from "@/lib/campaign";
import type { CreativeCopy, CreativeDirectionPlan, StructuredCreativeBrief } from "@/lib/ai/schemas";
import type { AdFormat } from "@/lib/formats";

export type ImageGenerationRequest = {
  campaign: CampaignInput;
  format: AdFormat;
  variationIndex: number;
  variationTitle: string;
  compositionSettings?: CompositionSettings;
  prompt: string;
  originalUserPrompt?: string;
  creativeBrief?: StructuredCreativeBrief;
  creativeConcept?: CreativeDirectionPlan;
  copy?: CreativeCopy;
  conversationHistory?: GeneratedVariation["conversationHistory"];
};

export type ImageGenerationProvider = {
  id: string;
  label: string;
  configured: boolean;
  model?: string;
  generateImage(request: ImageGenerationRequest): Promise<string>;
  editImage?(imageUrl: string, prompt: string): Promise<string>;
  generateVariations(requests: ImageGenerationRequest[]): Promise<GeneratedVariation[]>;
};

export abstract class BaseImageProvider implements ImageGenerationProvider {
  abstract id: string;
  abstract label: string;
  abstract configured: boolean;
  model?: string;
  abstract generateImage(request: ImageGenerationRequest): Promise<string>;

  async generateVariations(requests: ImageGenerationRequest[]): Promise<GeneratedVariation[]> {
    const generated = await Promise.all(
      requests.map(async (request) => {
        const backgroundUrl = await this.generateImage(request);
        const settings = request.compositionSettings ?? createDefaultSettings(request.variationIndex);

        return {
          id: crypto.randomUUID(),
          title: request.variationTitle,
          prompt: request.prompt,
          backgroundUrl,
          settings,
          originalUserPrompt: request.originalUserPrompt,
          creativeBrief: request.creativeBrief,
          creativeConcept: request.creativeConcept,
          imagePrompt: request.prompt,
          generatedImage: backgroundUrl,
          copy: request.copy,
          composition: settings,
          conversationHistory: request.conversationHistory,
          generationTimestamp: new Date().toISOString(),
          provider: this.id,
          model: this.model,
        };
      }),
    );

    return generated;
  }
}
