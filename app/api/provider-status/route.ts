import { NextResponse } from "next/server";
import { selectImageProvider } from "@/lib/ai/providers";

export async function GET() {
  const localMode =
    process.env.AI_PROVIDER === "local" ||
    process.env.CREATIVE_DIRECTOR_PROVIDER === "ollama" ||
    process.env.IMAGE_PROVIDER === "local-openvino" ||
    process.env.IMAGE_PROVIDER === "openvino";

  try {
    const [ollama, imageServer] = await Promise.all([checkOllama(), checkLocalImageServer()]);
    const status = selectImageProvider();
    const message = localMode
      ? buildLocalAiMessage(ollama, imageServer)
      : status.message;

    return NextResponse.json({
      provider: status.provider.id,
      label: status.provider.label,
      model: status.provider.model,
      mode: localMode ? "local" : status.mode,
      realAi: status.realAi,
      demoMode: status.demoMode,
      message,
      creativeDirector: localMode ? "ollama" : process.env.OPENAI_API_KEY && process.env.DEMO_MODE !== "true" ? "openai" : "mock",
      creativeDirectorModel: localMode
        ? process.env.OLLAMA_TEXT_MODEL ?? "llama3.2"
        : process.env.OPENAI_TEXT_MODEL ?? (process.env.OPENAI_API_KEY ? "gpt-4.1-mini" : "deterministic-mock-planner"),
      localAi: {
        ollama,
        imageServer,
        hardware: "Intel i7-1360P, Intel Iris Xe integrated graphics, 16 GB RAM",
      },
    });
  } catch (error) {
    const [ollama, imageServer] = await Promise.all([checkOllama(), checkLocalImageServer()]);

    return NextResponse.json(
      {
        provider: "unconfigured",
        mode: localMode ? "local" : "mock",
        realAi: false,
        demoMode: !localMode,
        message: error instanceof Error ? error.message : "Provider status is unavailable.",
        creativeDirector: localMode ? "ollama" : "mock",
        creativeDirectorModel: localMode ? process.env.OLLAMA_TEXT_MODEL ?? "llama3.2" : "deterministic-mock-planner",
        localAi: {
          ollama,
          imageServer,
          hardware: "Intel i7-1360P, Intel Iris Xe integrated graphics, 16 GB RAM",
        },
      },
      { status: 500 },
    );
  }
}

async function checkOllama() {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_TEXT_MODEL ?? "llama3.2";

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(1200),
    });
    if (!response.ok) return { available: false, model, modelAvailable: false, message: `Ollama HTTP ${response.status}` };
    const data = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
    const modelAvailable = Boolean(data.models?.some((item) => item.name === model || item.model === model || item.name?.startsWith(`${model}:`)));
    return {
      available: true,
      model,
      modelAvailable,
      message: modelAvailable ? "Ollama available; creative director model available." : "Ollama available; configured model is not pulled yet.",
    };
  } catch {
    return { available: false, model, modelAvailable: false, message: "Ollama is not reachable on this machine." };
  }
}

async function checkLocalImageServer() {
  const endpoint = process.env.LOCAL_IMAGE_API_URL;
  const model = process.env.LOCAL_IMAGE_MODEL ?? "OpenVINO/stable-diffusion-v1-5-int8-ov";
  const device = process.env.LOCAL_IMAGE_DEVICE ?? "AUTO";

  if (!endpoint) {
    return {
      available: false,
      model,
      device,
      message: "LOCAL_IMAGE_API_URL is not configured.",
      acceleration: "CPU/Intel GPU through OpenVINO when available.",
    };
  }

  try {
    const response = await fetch(`${endpoint.replace(/\/+$/, "")}/status`, {
      signal: AbortSignal.timeout(1600),
    });
    if (!response.ok) return { available: false, model, device, message: `Local image server HTTP ${response.status}` };
    const data = (await response.json()) as Record<string, unknown>;
    return {
      available: true,
      model: String(data.model ?? model),
      device: String(data.device ?? device),
      modelReady: Boolean(data.modelReady),
      message: String(data.message ?? "Local image server is reachable."),
      acceleration: String(data.acceleration ?? "CPU/limited Intel GPU mode"),
    };
  } catch {
    return {
      available: false,
      model,
      device,
      message: "Local image server is not reachable.",
      acceleration: "CPU/Intel GPU through OpenVINO when available.",
    };
  }
}

function buildLocalAiMessage(
  ollama: Awaited<ReturnType<typeof checkOllama>>,
  imageServer: Awaited<ReturnType<typeof checkLocalImageServer>>,
) {
  const parts = [
    "LOCAL AI",
    ollama.available ? "Ollama available" : "Ollama not reachable",
    ollama.modelAvailable ? "creative director model available" : "creative director model not pulled",
    imageServer.available ? "image server reachable" : "image server not ready",
    "image generation uses CPU/limited Intel GPU mode",
  ];

  return parts.join(" - ");
}
