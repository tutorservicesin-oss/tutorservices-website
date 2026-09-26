import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultCampaign, createDefaultSettings } from "@/lib/campaign";
import { getAdFormat } from "@/lib/formats";
import { OpenVinoLocalImageProvider } from "@/lib/ai/providers/openvino-local";

afterEach(() => vi.unstubAllGlobals());

describe("local image conditioning", () => {
  it("sends the concise visual concept and records that exact prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ b64_json: "test" })));
    vi.stubGlobal("fetch", fetchMock);
    const prompt = "One adult Indian tutor beside one teenage student, soft daylight.";
    const provider = new OpenVinoLocalImageProvider({ endpoint: "http://localhost:7861", steps: "30" });
    const variations = await provider.generateVariations([{
      campaign: defaultCampaign,
      format: getAdFormat("instagram-square"),
      variationIndex: 0,
      variationTitle: "Tutoring",
      prompt: "Long advertising brief and irrelevant compositor instructions",
      creativeConcept: {
        id: "one", conceptName: "Tutoring", artDirection: "Photograph",
        imagePrompt: prompt, layoutIntent: "Text left", subjectPlacement: "right", textSafeAreas: ["left"],
        composition: createDefaultSettings(0),
        copy: { headline: "Maths", subheadline: "Tuition", offer: "Free demo", cta: "Book now", benefits: [] },
      },
    }]);
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.prompt).toBe(prompt);
    expect(payload.width).toBe(512);
    expect(payload.steps).toBe(30);
    expect(payload.negativePrompt).toContain("collage");
    expect(variations[0].imagePrompt).toBe(prompt);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
