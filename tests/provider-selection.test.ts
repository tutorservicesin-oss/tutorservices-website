import { describe, expect, it } from "vitest";
import { selectImageProvider } from "@/lib/ai/providers";

describe("provider selection", () => {
  it("uses mock mode by default when no OpenAI key is configured", () => {
    const result = selectImageProvider({});

    expect(result.provider.id).toBe("mock");
    expect(result.demoMode).toBe(true);
    expect(result.realAi).toBe(false);
  });

  it("uses OpenAI when an OpenAI key is configured", () => {
    const result = selectImageProvider({ OPENAI_API_KEY: "test-key" });

    expect(result.provider.id).toBe("openai");
    expect(result.demoMode).toBe(false);
    expect(result.realAi).toBe(true);
  });

  it("uses local OpenVINO when local AI is configured", () => {
    const result = selectImageProvider({
      AI_PROVIDER: "local",
      LOCAL_IMAGE_API_URL: "http://127.0.0.1:7861",
    });

    expect(result.provider.id).toBe("local-openvino");
    expect(result.demoMode).toBe(false);
    expect(result.realAi).toBe(true);
  });

  it("does not fall back to mock visuals when local OpenVINO is selected without a URL", () => {
    expect(() => selectImageProvider({ IMAGE_PROVIDER: "local-openvino" })).toThrow(/LOCAL_IMAGE_API_URL/);
  });

  it("fails loudly when OpenAI is explicitly selected without a key", () => {
    expect(() => selectImageProvider({ IMAGE_PROVIDER: "openai" })).toThrow(/OPENAI_API_KEY/);
  });

  it("uses a configured local provider", () => {
    const result = selectImageProvider({
      IMAGE_PROVIDER: "local",
      LOCAL_IMAGE_API_URL: "http://127.0.0.1:8188/generate",
    });

    expect(result.provider.id).toBe("local");
    expect(result.demoMode).toBe(false);
    expect(result.realAi).toBe(true);
  });
});
