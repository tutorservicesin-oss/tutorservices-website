import { BaseImageProvider, type ImageGenerationRequest } from "@/lib/ai/image-provider";

type HttpProviderOptions = {
  id: "local" | "cloud";
  label: string;
  endpoint?: string;
  apiKey?: string;
  model?: string;
};

type ProviderResponse = {
  imageUrl?: string;
  b64_json?: string;
  mimeType?: string;
};

export class HttpImageProvider extends BaseImageProvider {
  id: "local" | "cloud";
  label: string;
  configured: boolean;
  model?: string;
  private endpoint?: string;
  private apiKey?: string;

  constructor(options: HttpProviderOptions) {
    super();
    this.id = options.id;
    this.label = options.label;
    this.endpoint = options.endpoint;
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.configured = Boolean(options.endpoint && (options.id === "local" || options.apiKey));
  }

  async generateImage(request: ImageGenerationRequest): Promise<string> {
    if (!this.endpoint || !this.configured) {
      throw new Error(`${this.label} is not configured.`);
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.format.width,
        height: request.format.height,
        model: this.model,
        variationIndex: request.variationIndex,
      }),
    });

    if (!response.ok) {
      throw new Error(`${this.label} failed with HTTP ${response.status}.`);
    }

    const data = (await response.json()) as ProviderResponse;

    if (data.imageUrl) return data.imageUrl;
    if (data.b64_json) return `data:${data.mimeType ?? "image/png"};base64,${data.b64_json}`;

    throw new Error(`${this.label} did not return imageUrl or b64_json.`);
  }
}
