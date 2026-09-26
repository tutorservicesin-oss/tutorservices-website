import type { ImageGenerationProvider } from "@/lib/ai/image-provider";
import { DemoImageProvider } from "@/lib/ai/providers/demo-provider";
import { HttpImageProvider } from "@/lib/ai/providers/http-provider";
import { OpenAIImageProvider } from "@/lib/ai/providers/openai";
import { OpenVinoLocalImageProvider } from "@/lib/ai/providers/openvino-local";

export type ProviderSelection = {
  provider: ImageGenerationProvider;
  mode: "real" | "mock";
  demoMode: boolean;
  realAi: boolean;
  message: string;
};

type ProviderEnvironment = Record<string, string | undefined>;

export function selectImageProvider(env: ProviderEnvironment = process.env): ProviderSelection {
  const hasOpenAIKey = Boolean(env.OPENAI_API_KEY);
  const aiProvider = (env.AI_PROVIDER ?? "").toLowerCase();
  const requestedProvider = (env.IMAGE_PROVIDER ?? (aiProvider === "local" ? "local-openvino" : hasOpenAIKey ? "openai" : "mock")).toLowerCase();
  const mockMode = env.DEMO_MODE === "true" || requestedProvider === "demo" || requestedProvider === "mock";

  if (mockMode) {
    return {
      provider: new DemoImageProvider(),
      mode: "mock",
      demoMode: true,
      realAi: false,
      message: "Real AI provider not configured - Mock Mode.",
    };
  }

  if (requestedProvider === "openai") {
    if (!hasOpenAIKey) {
      throw new Error("IMAGE_PROVIDER=openai was selected, but OPENAI_API_KEY is missing.");
    }

    return {
      provider: new OpenAIImageProvider({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_IMAGE_MODEL,
        quality: env.OPENAI_IMAGE_QUALITY,
      }),
      mode: "real",
      demoMode: false,
      realAi: true,
      message: "REAL AI - OpenAI image generation connected.",
    };
  }

  if (requestedProvider === "local-openvino" || requestedProvider === "openvino") {
    if (!env.LOCAL_IMAGE_API_URL) {
      throw new Error("IMAGE_PROVIDER=local-openvino requires LOCAL_IMAGE_API_URL. Mock visuals are not used in local AI mode.");
    }

    return {
      provider: new OpenVinoLocalImageProvider({
        endpoint: env.LOCAL_IMAGE_API_URL,
        model: env.LOCAL_IMAGE_MODEL,
        device: env.LOCAL_IMAGE_DEVICE,
        steps: env.LOCAL_IMAGE_STEPS,
      }),
      mode: "real",
      demoMode: false,
      realAi: true,
      message: "LOCAL AI - OpenVINO image provider configured.",
    };
  }

  if (requestedProvider === "local") {
    const provider = new HttpImageProvider({
      id: "local",
      label: "Local image provider",
      endpoint: env.LOCAL_IMAGE_API_URL,
    });

    if (provider.configured) {
      return { provider, mode: "real", demoMode: false, realAi: true, message: "REAL AI - Local image provider connected." };
    }
  }

  if (requestedProvider === "cloud") {
    const provider = new HttpImageProvider({
      id: "cloud",
      label: "Cloud image provider",
      endpoint: env.CLOUD_IMAGE_API_URL,
      apiKey: env.CLOUD_IMAGE_API_KEY,
      model: env.CLOUD_IMAGE_MODEL,
    });

    if (provider.configured) {
      return { provider, mode: "real", demoMode: false, realAi: true, message: "REAL AI - Cloud image provider connected." };
    }
  }

  return {
    provider: new DemoImageProvider(),
    mode: "mock",
    demoMode: true,
    realAi: false,
    message: "Real AI provider not configured - Mock Mode.",
  };
}
