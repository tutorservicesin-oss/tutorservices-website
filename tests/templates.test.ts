import { describe, expect, it } from "vitest";
import { compositionTemplates, getTextBox } from "@/lib/templates";

describe("composition templates", () => {
  it("provides eight premium ad templates", () => {
    expect(compositionTemplates.map((template) => template.id)).toEqual([
      "split-hero",
      "full-bleed-hero",
      "parent-trust",
      "exam-success",
      "premium-minimal",
      "results-benefits",
      "local-service",
      "subject-hero",
    ]);
  });

  it("keeps template text boxes inside the canvas", () => {
    for (const template of compositionTemplates) {
      const box = getTextBox(template.id, 1080, 1080);

      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(1080);
      expect(box.y + box.height).toBeLessThanOrEqual(1080);
    }
  });
});
