export type VisualStyle = {
  id: string;
  name: string;
  promptTone: string;
};

export const visualStyles: VisualStyle[] = [
  { id: "modern-education", name: "Modern Education", promptTone: "clean modern education workspace with crisp natural lighting" },
  { id: "premium-education", name: "Premium Education", promptTone: "premium private tutoring look, refined lighting, confident aspirational mood" },
  { id: "professional", name: "Professional", promptTone: "professional consulting style, trustworthy, polished, uncluttered" },
  { id: "bright-friendly", name: "Bright & Friendly", promptTone: "bright friendly learning moment, welcoming and approachable" },
  { id: "exam-preparation", name: "Exam Preparation", promptTone: "focused exam preparation atmosphere with books, notes, and determined students" },
  { id: "parent-focused", name: "Parent Focused", promptTone: "parent and student education decision moment, caring and trustworthy" },
  { id: "minimal", name: "Minimal", promptTone: "minimal educational background with generous clean negative space" },
  { id: "3d-education", name: "3D Education", promptTone: "premium 3D education scene, polished objects, soft studio lighting" },
  { id: "photorealistic", name: "Photorealistic", promptTone: "photorealistic Indian tutoring scene with authentic classroom or home study detail" },
  { id: "corporate", name: "Corporate", promptTone: "corporate training quality, clean premium business education environment" },
];

export function getVisualStyle(styleId: string): VisualStyle {
  const style = visualStyles.find((item) => item.id === styleId);
  if (!style) {
    throw new Error(`Unknown visual style: ${styleId}`);
  }

  return style;
}
