import { describe, expect, it } from "vitest";
import { defaultCampaign } from "@/lib/campaign";
import { validateCampaign } from "@/lib/validation/campaign";

describe("campaign validation", () => {
  it("accepts the success-criteria campaign", () => {
    expect(validateCampaign(defaultCampaign).valid).toBe(true);
  });

  it("requires custom audience text", () => {
    const result = validateCampaign({ ...defaultCampaign, audience: "Custom", customAudience: "" });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Custom audience is required.");
  });
});
