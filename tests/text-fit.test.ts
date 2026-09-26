import { describe, expect, it } from "vitest";
import { fitTextToBox, wrapText } from "@/lib/compositor/text-fit";

describe("text fitting", () => {
  it("wraps copy within the requested width", () => {
    const lines = wrapText("Master Class 10 Maths with Expert Tutors", 42, 360, "800");

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line) => line.width <= 360)).toBe(true);
  });

  it("reduces font size until text fits vertically", () => {
    const result = fitTextToBox({
      text: "Personalized home tuition for better concepts, confidence and results.",
      maxWidth: 420,
      maxHeight: 120,
      maxFontSize: 44,
      minFontSize: 18,
      fontWeight: "700",
    });

    expect(result.fits).toBe(true);
    expect(result.fontSize).toBeLessThanOrEqual(44);
  });
});
