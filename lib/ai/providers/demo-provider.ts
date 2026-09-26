import { BaseImageProvider, type ImageGenerationRequest } from "@/lib/ai/image-provider";

const demoBackgrounds = [
  "/demo-backgrounds/tutor-student.jpg",
  "/demo-backgrounds/exam-success.jpg",
  "/demo-backgrounds/parent-trust.jpg",
  "/demo-backgrounds/subject-hero.jpg",
];

export class DemoImageProvider extends BaseImageProvider {
  id = "mock";
  label = "Mock image provider";
  configured = true;
  model = "local-mock-visuals";

  async generateImage(request: ImageGenerationRequest): Promise<string> {
    return demoBackgrounds[request.variationIndex % demoBackgrounds.length];
  }
}
