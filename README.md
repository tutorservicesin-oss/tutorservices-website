# TutorServices AI Ad Studio

TutorServices AI Ad Studio is a private, local-first advertising creative agent for TutorServices. The primary workflow is conversational: describe the ad in natural language, let the creative director infer the brief, and generate four branded creative directions. It separates generated background imagery from final ad composition so the headline, description, offer, CTA, tagline, and logo are rendered exactly by the application.

## What it does

- Creates four branded ad variations from one natural-language request.
- Infers audience, subject, location, tone, offer, CTA, ad format, copy and composition through Ollama locally or OpenAI when explicitly configured.
- Supports TutorServices logo branding from `public/branding/tutorservices-logo.jpeg`.
- Includes presets for Instagram, Facebook, Google Display, website banners, YouTube thumbnails, and WhatsApp status.
- Provides conversational refinement commands such as "Make number 2 more premium" or "Make the offer much more prominent."
- Keeps manual canvas controls available for logo placement, text position, template, font size, overlay opacity, and image positioning.
- Saves campaigns locally in browser IndexedDB.
- Exports finished ads as PNG or JPG at the exact selected dimensions.
- Runs in transparent Mock Mode without an image API key.
- Supports a local-first AI mode with Ollama for text planning and OpenVINO for image generation on Intel CPU/Iris Xe hardware.

## Install

```bash
pnpm install
```

## Run locally

```bash
pnpm dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Build for production

```bash
pnpm build
pnpm start
```

## Quality checks

```bash
pnpm lint
pnpm test
```

## Mock Mode

Mock Mode is enabled when `DEMO_MODE=true`, `IMAGE_PROVIDER=mock`, `IMAGE_PROVIDER=demo`, or no configured provider is available. The mock provider returns deterministic local educational photo backgrounds and still runs the same prompt-building, compositor, save and export flow. The app completes this workflow:

Describe ad -> AI creative brief -> Generate four directions -> Refine with chat -> Preview -> Edit -> Save -> Export.

Mock Mode does not claim cloud image generation is free or real. The status bar shows `MOCK MODE` when local fallback visuals are being used.

## Environment variables

Copy `.env.example` to `.env.local` and adjust values as needed.

```bash
DEMO_MODE=false
AI_PROVIDER=local
IMAGE_PROVIDER=local-openvino
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_QUALITY=medium
CREATIVE_DIRECTOR_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TEXT_MODEL=llama3.2
LOCAL_IMAGE_API_URL=http://127.0.0.1:7861
LOCAL_IMAGE_MODEL=OpenVINO/stable-diffusion-v1-5-int8-ov
LOCAL_IMAGE_DEVICE=AUTO
LOCAL_IMAGE_STEPS=12
CLOUD_IMAGE_API_URL=
CLOUD_IMAGE_API_KEY=
CLOUD_IMAGE_MODEL=
```

## Configure an image provider

Provider selection happens only on the server in `lib/ai/providers/index.ts`.

- `AI_PROVIDER=local`, `CREATIVE_DIRECTOR_PROVIDER=ollama`, and `IMAGE_PROVIDER=local-openvino` use the local-first stack.
- If `OPENAI_API_KEY` exists and `IMAGE_PROVIDER` is omitted, OpenAI is used automatically.
- `IMAGE_PROVIDER=openai` uses OpenAI image generation through `OPENAI_API_KEY`.
- `IMAGE_PROVIDER=mock` or `IMAGE_PROVIDER=demo` uses local deterministic fallback backgrounds.
- `IMAGE_PROVIDER=local` uses `LOCAL_IMAGE_API_URL`.
- `IMAGE_PROVIDER=cloud` uses `CLOUD_IMAGE_API_URL`, `CLOUD_IMAGE_API_KEY`, and optional `CLOUD_IMAGE_MODEL`.
- If `IMAGE_PROVIDER=openai` is selected without `OPENAI_API_KEY`, generation fails with a clear server-side error rather than silently falling back.
- If `IMAGE_PROVIDER=local-openvino` is selected without `LOCAL_IMAGE_API_URL`, generation fails clearly and does not use mock visuals.

## Local AI on Intel Iris Xe

Use a small text model and one local image at a time for this laptop.

- Text model to test first: `llama3.2` in Ollama, 3B class, about 2 GB.
- Image model to test first: `OpenVINO/stable-diffusion-v1-5-int8-ov`, about 2.3 GB.
- Expected image RAM fit: practical for 16 GB RAM at 512-640 px generation, one image at a time.
- Intel Iris Xe acceleration: possible through OpenVINO `AUTO`/`GPU` if drivers support it; not comparable to NVIDIA CUDA.
- CPU fallback: supported.
- Likely speed: SLOW to VERY SLOW.
- Expected quality: acceptable for a first genuine local proof, below modern cloud models and high-end GPU SDXL/FLUX.

The local image server lives at `scripts/local-ai/openvino_image_server.py`. It will not download the model unless launched with `--allow-download`.

The generic HTTP provider expects a JSON response with either:

```json
{ "imageUrl": "https://example.com/generated.png" }
```

or:

```json
{ "b64_json": "...", "mimeType": "image/png" }
```

Never expose provider API keys in client components.

## Creative director

The creative director lives in `lib/ai/creative-director.ts`. With `CREATIVE_DIRECTOR_PROVIDER=ollama`, it uses Ollama structured JSON output. With `IMAGE_PROVIDER=local-openvino`, image generation is handled by the local OpenVINO server. OpenAI remains available only when explicitly configured.

- `CreativeBrief`
- `CampaignInput`
- four creative directions
- image art-direction prompts
- compositor settings
- an assistant-style response for the chat UI

Without a configured Ollama/OpenAI provider, the deterministic mock planner is used so the UI remains testable.

## Add a local image provider

Create a provider under `lib/ai/providers/` that implements `ImageGenerationProvider` from `lib/ai/image-provider.ts`. Then update `selectImageProvider()` to return it when the relevant environment variables are configured. A future ComfyUI, Stable Diffusion, Flux, or other local HTTP bridge can fit behind the same interface.

## Add new templates

Add a template to `compositionTemplates` in `lib/templates.ts`, then update `getTextBox()` if the new layout needs a distinct text box. Templates are fallback composition systems; the creative director chooses when to use them. The canvas compositor in `lib/compositor/canvas.ts` renders application text, offer badges, CTAs, logo, and tagline over the generated background.

## Modify TutorServices branding

Brand defaults live in `lib/brand.ts`. The official logo is loaded from:

```text
public/branding/tutorservices-logo.jpeg
```

Change colors, typography, default CTA, and default logo placement there.

## Version 2 ideas

- Editable saved brand kits.
- Hindi, English, and bilingual ad copy modes.
- A richer local model bridge for ComfyUI or Flux.
- Background editing and subject-aware image regeneration.
- Bulk campaign generation and custom templates.
- Optional video ad generation.
