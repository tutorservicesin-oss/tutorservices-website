import { BaseImageProvider, type ImageGenerationRequest } from "@/lib/ai/image-provider";
import { createDefaultSettings } from "@/lib/campaign";
import type { GeneratedVariation } from "@/lib/campaign";

type OpenVinoLocalOptions = {
  endpoint?: string;
  model?: string;
  device?: string;
  steps?: string;
};

type OpenVinoImageResponse = {
  imageUrl?: string;
  b64_json?: string;
  image?: string;
  mimeType?: string;
  provider?: string;
  model?: string;
  device?: string;
};

export class OpenVinoLocalImageProvider extends BaseImageProvider {
  id = "local-openvino";
  label = "Local OpenVINO image provider";
  configured: boolean;
  model?: string;
  private endpoint?: string;
  private device: string;
  private steps: number;

  constructor(options: OpenVinoLocalOptions) {
    super();
    this.endpoint = options.endpoint;
    this.model = options.model ?? "OpenVINO/stable-diffusion-v1-5-int8-ov";
    this.device = options.device ?? "AUTO";
    const steps = Number(options.steps ?? 30);
    this.steps = Number.isFinite(steps) ? Math.max(20, Math.min(40, steps)) : 30;
    this.configured = Boolean(options.endpoint);
  }

  async generateImage(request: ImageGenerationRequest): Promise<string> {
    if (!this.endpoint) {
      throw new Error("LOCAL_IMAGE_API_URL is required for local OpenVINO image generation.");
    }

    const payload = {
      prompt: request.creativeConcept?.imagePrompt || request.prompt,
      negativePrompt:
        "collage, panels, split screen, text, logo, watermark, illustration, cartoon, 3d render, crowd, extra people, duplicate faces, deformed face, bad anatomy, extra limbs, fused hands, extra fingers, missing fingers, crossed eyes, plastic skin, overexposed, blurry",
      guidanceScale: 5.5,
      width: localGenerationWidth(request.format.width, request.format.height),
      height: localGenerationHeight(request.format.width, request.format.height),
      steps: this.steps,
      device: this.device,
      model: this.model,
      seed: Math.floor(Math.random() * 2_147_483_647),
    };

    const response = await postWithBusyRetry(joinUrl(this.endpoint, "/generate"), payload);

    const data = (await response.json()) as OpenVinoImageResponse;
    if (data.imageUrl) return data.imageUrl;
    if (data.b64_json) return `data:${data.mimeType ?? "image/png"};base64,${data.b64_json}`;
    if (data.image?.startsWith("data:")) return data.image;

    throw new Error("Local OpenVINO image server did not return imageUrl, b64_json, or image.");
  }

  async generateVariations(requests: ImageGenerationRequest[]): Promise<GeneratedVariation[]> {
    const generated: GeneratedVariation[] = [];

    for (const request of requests) {
      const imagePrompt = request.creativeConcept?.imagePrompt || request.prompt;
      const backgroundUrl = await this.generateImage(request);
      const settings = request.compositionSettings ?? createDefaultSettings(request.variationIndex);

      generated.push({
        id: crypto.randomUUID(),
        title: request.variationTitle,
        prompt: imagePrompt,
        backgroundUrl,
        settings,
        originalUserPrompt: request.originalUserPrompt,
        creativeBrief: request.creativeBrief,
        creativeConcept: request.creativeConcept,
        imagePrompt,
        generatedImage: backgroundUrl,
        copy: request.copy,
        composition: settings,
        conversationHistory: request.conversationHistory,
        generationTimestamp: new Date().toISOString(),
        provider: this.id,
        model: this.model,
      });
    }

    return generated;
  }
}

async function postWithBusyRetry(url: string, payload: unknown): Promise<Response> {
  let lastMessage = "";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) return response;

    lastMessage = await response.text();
    if (!/Infer Request is busy/i.test(lastMessage)) {
      throw new Error(`Local OpenVINO image generation failed: ${lastMessage || `HTTP ${response.status}`}`);
    }

    await sleep(1500 * (attempt + 1));
  }

  throw new Error(`Local OpenVINO image generation failed: ${lastMessage || "OpenVINO inference stayed busy."}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function localGenerationWidth(width: number, height: number) {
  if (width / height > 1.18) return 768;
  if (width / height < 0.85) return 512;
  return 512;
}

function localGenerationHeight(width: number, height: number) {
  if (width / height > 1.18) return 512;
  if (width / height < 0.85) return 768;
  return 512;
}

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}${path}`;
}
