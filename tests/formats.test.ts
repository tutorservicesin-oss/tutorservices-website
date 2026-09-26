import { describe, expect, it } from "vitest";
import { adFormats, getAdFormat } from "@/lib/formats";

describe("ad formats", () => {
  it("contains every required export preset", () => {
    expect(adFormats).toHaveLength(8);
    expect(getAdFormat("instagram-square")).toMatchObject({ width: 1080, height: 1080 });
    expect(getAdFormat("social-portrait")).toMatchObject({ width: 1080, height: 1350 });
    expect(getAdFormat("social-story")).toMatchObject({ width: 1080, height: 1920 });
    expect(getAdFormat("facebook-landscape")).toMatchObject({ width: 1200, height: 628 });
    expect(getAdFormat("google-display-landscape")).toMatchObject({ width: 1200, height: 628 });
    expect(getAdFormat("website-banner")).toMatchObject({ width: 1920, height: 1080 });
    expect(getAdFormat("youtube-thumbnail")).toMatchObject({ width: 1280, height: 720 });
    expect(getAdFormat("whatsapp-status")).toMatchObject({ width: 1080, height: 1920 });
  });

  it("rejects unknown formats", () => {
    expect(() => getAdFormat("unknown")).toThrow("Unknown ad format");
  });
});
