import type { LogoPosition } from "@/lib/brand";

export type TextPosition = "left" | "center" | "right" | "bottom";
export type TemplateRole =
  | "split-hero"
  | "full-bleed"
  | "parent-trust"
  | "exam-success"
  | "premium-minimal"
  | "results-benefits"
  | "local-service"
  | "subject-hero";

export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutBox = NormalizedBox;

export type CompositionTemplate = {
  id: string;
  name: string;
  role: TemplateRole;
  textPosition: TextPosition;
  defaultLogoPosition: LogoPosition;
  defaultImagePosition: "center" | "left" | "right";
  defaultImageZoom: number;
  defaultOverlayOpacity: number;
  negativeSpace: string;
  description: string;
  useBenefits: boolean;
  emphasizeSubject: boolean;
};

export const compositionTemplates: CompositionTemplate[] = [
  {
    id: "split-hero",
    name: "Split Hero",
    role: "split-hero",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "right",
    defaultImageZoom: 1.18,
    defaultOverlayOpacity: 0.86,
    negativeSpace: "left 46 percent, with the tutor or student subject large on the right",
    description: "Strong left-side sales message with a large right-side tutor/student visual.",
    useBenefits: false,
    emphasizeSubject: false,
  },
  {
    id: "full-bleed-hero",
    name: "Full Bleed Hero",
    role: "full-bleed",
    textPosition: "bottom",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "center",
    defaultImageZoom: 1.25,
    defaultOverlayOpacity: 0.68,
    negativeSpace: "lower third and top-left corner over full-bleed photography",
    description: "High-impact full-canvas photography with controlled overlay and large ad copy.",
    useBenefits: false,
    emphasizeSubject: false,
  },
  {
    id: "parent-trust",
    name: "Parent Trust",
    role: "parent-trust",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "right",
    defaultImageZoom: 1.16,
    defaultOverlayOpacity: 0.82,
    negativeSpace: "left side for trust-led copy, parent/tutor consultation on the right",
    description: "Trust and results layout with benefit chips for parents.",
    useBenefits: true,
    emphasizeSubject: false,
  },
  {
    id: "exam-success",
    name: "Exam Success",
    role: "exam-success",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "right",
    defaultImageZoom: 1.22,
    defaultOverlayOpacity: 0.9,
    negativeSpace: "left side for high-energy exam headline and result cues",
    description: "High-energy exam preparation ad with subject/result visual language.",
    useBenefits: true,
    emphasizeSubject: true,
  },
  {
    id: "premium-minimal",
    name: "Premium Minimal",
    role: "premium-minimal",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "center",
    defaultImageZoom: 1.12,
    defaultOverlayOpacity: 0.78,
    negativeSpace: "calm editorial copy zone with strong photography visible",
    description: "Premium editorial education ad with intentional whitespace and refined typography.",
    useBenefits: false,
    emphasizeSubject: false,
  },
  {
    id: "results-benefits",
    name: "Results Benefits",
    role: "results-benefits",
    textPosition: "center",
    defaultLogoPosition: "top-center",
    defaultImagePosition: "center",
    defaultImageZoom: 1.12,
    defaultOverlayOpacity: 0.84,
    negativeSpace: "upper half for headline and benefit blocks, large visual below",
    description: "Benefits-first layout with three compact proof chips and a clear CTA.",
    useBenefits: true,
    emphasizeSubject: false,
  },
  {
    id: "local-service",
    name: "Local Service",
    role: "local-service",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "right",
    defaultImageZoom: 1.2,
    defaultOverlayOpacity: 0.86,
    negativeSpace: "left and lower-left for local service message and location badge",
    description: "Local tutoring/service ad emphasizing area, class range, and free demo.",
    useBenefits: true,
    emphasizeSubject: false,
  },
  {
    id: "subject-hero",
    name: "Subject Hero",
    role: "subject-hero",
    textPosition: "left",
    defaultLogoPosition: "top-left",
    defaultImagePosition: "right",
    defaultImageZoom: 1.18,
    defaultOverlayOpacity: 0.88,
    negativeSpace: "left for oversized subject headline, right for education visual",
    description: "Big subject-name creative with strong tutoring promise, offer, and CTA.",
    useBenefits: false,
    emphasizeSubject: true,
  },
];

export function getCompositionTemplate(templateId: string): CompositionTemplate {
  const template = compositionTemplates.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown composition template: ${templateId}`);
  }

  return template;
}

function toAbsoluteBox(box: NormalizedBox, width: number, height: number): LayoutBox {
  return {
    x: Math.round(box.x * width),
    y: Math.round(box.y * height),
    width: Math.round(box.width * width),
    height: Math.round(box.height * height),
  };
}

export function getTextBox(templateId: string, width: number, height: number): LayoutBox {
  const template = getCompositionTemplate(templateId);
  const portrait = height / width > 1.25;
  const landscape = width / height > 1.45;

  const boxes: Record<TemplateRole, NormalizedBox> = {
    "split-hero": landscape
      ? { x: 0.06, y: 0.21, width: 0.45, height: 0.62 }
      : { x: 0.07, y: 0.31, width: 0.55, height: 0.5 },
    "full-bleed": portrait
      ? { x: 0.07, y: 0.52, width: 0.86, height: 0.36 }
      : { x: 0.06, y: 0.49, width: 0.78, height: 0.36 },
    "parent-trust": { x: 0.06, y: 0.31, width: portrait ? 0.78 : 0.52, height: 0.5 },
    "exam-success": { x: 0.06, y: 0.31, width: landscape ? 0.5 : 0.58, height: 0.52 },
    "premium-minimal": { x: 0.07, y: 0.31, width: portrait ? 0.78 : 0.5, height: 0.5 },
    "results-benefits": { x: 0.08, y: 0.16, width: 0.84, height: portrait ? 0.42 : 0.48 },
    "local-service": { x: 0.06, y: 0.31, width: portrait ? 0.78 : 0.54, height: 0.5 },
    "subject-hero": { x: 0.06, y: 0.31, width: landscape ? 0.52 : 0.6, height: 0.54 },
  };

  return toAbsoluteBox(boxes[template.role], width, height);
}
