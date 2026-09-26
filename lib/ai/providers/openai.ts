import { BaseImageProvider, type ImageGenerationRequest } from "@/lib/ai/image-provider";

type OpenAIImageProviderOptions = {
  apiKey?: string;
  model?: string;
  quality?: string;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
};

type OpenAIErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

export class OpenAIImageProvider extends BaseImageProvider {
  id = "openai";
  label = "OpenAI image generation";
  configured: boolean;
  model: string;
  private apiKey?: string;
  private quality: string;

  constructor(options: OpenAIImageProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gpt-image-1";
    this.quality = options.quality ?? "medium";
    this.configured = Boolean(options.apiKey);
  }

  async generateImage(request: ImageGenerationRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI image provider selected but OPENAI_API_KEY is missing.");
    }

    const body = {
      model: this.model,
      prompt: hardenImagePrompt(request.prompt),
      size: closestOpenAIImageSize(request.format.width, request.format.height),
      quality: this.quality,
      output_format: "png",
      n: 1,
    };

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await safeOpenAIError(response);
      throw new Error(`OpenAI image generation failed: ${message}`);
    }

    const data = (await response.json()) as OpenAIImageResponse;
    const image = data.data?.[0];
    if (image?.b64_json) return `data:image/png;base64,${image.b64_json}`;
    if (image?.url) return image.url;

    throw new Error("OpenAI image generation did not return an image.");
  }
}

function closestOpenAIImageSize(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.18) return "1536x1024";
  if (ratio < 0.85) return "1024x1536";
  return "1024x1024";
}

function hardenImagePrompt(prompt: string) {
  return [
    prompt,
    "Critical compositor rule: create only the visual background, people, environment, and educational atmosphere.",
    "Do not render any readable words, numbers, headline text, CTA text, offer text, logo, brand mark, website, phone number, watermark, signboard, poster, UI, or random typography.",
    "Leave clean controlled negative space for the application to add exact TutorServices branding and marketing copy afterward.",
  ].join(" ");
}

async function safeOpenAIError(response: Response) {
  try {
    const data = (await response.json()) as OpenAIErrorResponse;
    return data.error?.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}
