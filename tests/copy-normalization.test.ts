import { describe, expect, it } from "vitest";
import { defaultCampaign } from "@/lib/campaign";
import { normalizeAdCopy } from "@/lib/compositor/copy";

describe("copy normalization", () => {
  it("keeps the brand tagline out of the campaign headline and repeated support", () => {
    const copy = normalizeAdCopy({
      ...defaultCampaign,
      advertising: "Class 10 Maths home tuition",
      headline: "Learn Smarter, Achieve Faster",
      description: "Learn Smarter, Achieve Faster",
      location: "Dwarka",
    });
    expect(copy.headline).toBe("Master Class 10 Maths");
    expect(copy.support).toBe("Expert Tutors in Dwarka");
  });
  it("splits long expert tutor headlines into a stronger ad headline", () => {
    const copy = normalizeAdCopy({
      ...defaultCampaign,
      headline: "Master Class 10 Maths with Expert Tutors",
      description: "Learn with Expert Home Tutors",
      offer: "Free Demo Class",
      cta: "Book Now",
    });

    expect(copy.headline).toBe("Master Class 10 Maths");
    expect(copy.support).toBe("Learn with Expert Home Tutors");
    expect(copy.offer).toBe("FREE DEMO CLASS");
    expect(copy.cta).toBe("BOOK NOW");
  });

  it("limits benefit chips to three compact claims", () => {
    const copy = normalizeAdCopy(defaultCampaign);

    expect(copy.benefits.length).toBeLessThanOrEqual(3);
  });
});
