# Local image quality audit

## Current model and runtime

- Model: OpenVINO/stable-diffusion-v1-5-int8-ov (base SD 1.5, not a photography-specific fine-tune).
- Weights: INT8 asymmetric compression, ratio 1.0, per the publisher's model card.
- Installed scheduler configuration: PNDMScheduler, scaled_linear beta schedule.
- Previous square settings: 640x640, 12 steps, CFG 7.5, AUTO device.
- Corrected benchmark: 512x512, 30 steps, CFG 5.5, explicit GPU.
- OpenVINO detects both i7-1360P CPU and Intel Iris Xe GPU. Successful explicit GPU runs establish GPU inference for these tests. Historical AUTO execution cannot be determined retroactively.
- The Python compatibility retry previously discarded negative conditioning on TypeError. It has been removed. The supported seed argument is rng_seed, not seed.
- Provider square resolution is now 512; configured steps are bounded to 20-40 (default 30). Existing explicit 12-step configuration resolves to 20. Set LOCAL_IMAGE_STEPS=30 to match the benchmark.
- Generated files are raw visual assets. Logo and copy remain compositor responsibilities. Upscaling does not repair anatomy.

## Visual review: rejected

These are sequential single-image experiments, not an approved four-image batch.

1. local-ai-quality-test.png: seed 42, 194.09 seconds including model load. Two people, but ambiguous adult/student roles, overlapping writing hands, and no left text-safe area. REJECTED.
2. local-ai-quality-retry.png: seed 123, 185.8 seconds including model load. Unrequested collage, repeated subjects, malformed hands and objects. REJECTED.

Do not use either image in a paid campaign. No image is automatically approved based on HTTP success. The response qualityStatus is requires-human-review; this is a label, not an automated vision classifier. Four-image quality approval is withheld.

## One model recommended next (not downloaded)

Realistic Vision 5.1, with the publisher-recommended MSE VAE, converted to OpenVINO. This remains an SD 1.5-sized model and is a better candidate for photography, not a guarantee of correct faces or hands.

- Estimated selected FP16 weights download: 2-4 GB including components/VAE; exact file total must be checked before download. Avoid downloading every precision variant.
- Estimated inference RAM/shared GPU memory: 6-10 GB at 512 square; conversion can require substantially more. Allow additional disk space for the exported model. These are planning estimates, not laptop measurements.
- Intel GPU execution through OpenVINO is possible; this specific model conversion has not been tested here. CPU execution is also supported by the architecture.
- Expected speed: SLOW on Iris Xe, VERY SLOW on CPU. Estimated minutes per image, not interactive generation.
- Expected quality: a better photographic candidate than base SD 1.5, with persistent anatomy risks. Must pass the same manual gate before batch use.
- No model change, paid service, or additional download was performed.

Sources:
- https://huggingface.co/OpenVINO/stable-diffusion-v1-5-int8-ov
- https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- https://openvinotoolkit.github.io/openvino.genai/docs/samples/python/image_generation/

## Reproduce the initial benchmark

```powershell
python scripts/local-ai/openvino_image_server.py --generate-once --device GPU --model-dir "$env:USERPROFILE\.tutorservices-ai\models\stable-diffusion-v1-5-int8-ov" --output local-ai-quality-test.png
python scripts/local-ai/test_openvino_image_server.py
pnpm test
pnpm lint
pnpm build
```

Do not run another model process concurrently on this 16 GB laptop. The --prompt and --seed options allow controlled single-image experiments without downloading models.
