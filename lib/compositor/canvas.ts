import { defaultBrandKit } from "@/lib/brand";
import type { CampaignInput, CompositionSettings } from "@/lib/campaign";
import { normalizeAdCopy, type NormalizedAdCopy } from "@/lib/compositor/copy";
import { fitTextToBox } from "@/lib/compositor/text-fit";
import type { AdFormat } from "@/lib/formats";
import { getCompositionTemplate, getTextBox, type CompositionTemplate, type LayoutBox } from "@/lib/templates";

export type ComposePayload = {
  canvas: HTMLCanvasElement;
  background: HTMLImageElement;
  logo: HTMLImageElement;
  campaign: CampaignInput;
  format: AdFormat;
  settings: CompositionSettings;
};

type NormalizedSettings = CompositionSettings & {
  imageZoom: number;
  focalX: number;
  focalY: number;
  offerScale: number;
};

const brand = defaultBrandKit.colors;

function normalizeSettings(settings: CompositionSettings, template: CompositionTemplate): NormalizedSettings {
  return {
    ...settings,
    imageZoom: Number.isFinite(settings.imageZoom) ? settings.imageZoom : template.defaultImageZoom,
    focalX: Number.isFinite(settings.focalX) ? settings.focalX : template.defaultImagePosition === "right" ? 0.72 : 0.5,
    focalY: Number.isFinite(settings.focalY) ? settings.focalY : 0.48,
    overlayOpacity: Number.isFinite(settings.overlayOpacity) ? settings.overlayOpacity : template.defaultOverlayOpacity,
    offerScale: Number.isFinite(settings.offerScale) ? settings.offerScale : 1,
  };
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  settings: NormalizedSettings,
) {
  const coverScale = Math.max(width / image.width, height / image.height) * Math.max(settings.imageZoom, 1);
  const drawWidth = image.width * coverScale;
  const drawHeight = image.height * coverScale;
  const focalX = settings.imagePosition === "left" ? Math.min(settings.focalX, 0.38) : settings.imagePosition === "right" ? Math.max(settings.focalX, 0.62) : settings.focalX;
  const rawX = width * focalX - drawWidth * focalX;
  const rawY = height * settings.focalY - drawHeight * settings.focalY;
  const x = Math.min(0, Math.max(width - drawWidth, rawX));
  const y = Math.min(0, Math.max(height - drawHeight, rawY));

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRounded(ctx: CanvasRenderingContext2D, box: LayoutBox, color: string, radius: number) {
  ctx.fillStyle = color;
  drawRoundedRect(ctx, box.x, box.y, box.width, box.height, radius);
  ctx.fill();
}

function shadow(ctx: CanvasRenderingContext2D, color = "rgba(7, 29, 73, 0.22)", blur = 32, offsetY = 16) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawGradientOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, direction: "left" | "right" | "bottom" | "full", opacity: number) {
  const gradient =
    direction === "bottom"
      ? ctx.createLinearGradient(0, height, 0, height * 0.25)
      : direction === "right"
        ? ctx.createLinearGradient(width, 0, width * 0.15, 0)
        : ctx.createLinearGradient(0, 0, width, 0);

  if (direction === "full") {
    const fullGradient = ctx.createLinearGradient(0, 0, width, height);
    fullGradient.addColorStop(0, `rgba(7, 29, 73, ${opacity})`);
    fullGradient.addColorStop(0.55, `rgba(7, 29, 73, ${opacity * 0.38})`);
    fullGradient.addColorStop(1, `rgba(0, 155, 122, ${opacity * 0.28})`);
    ctx.fillStyle = fullGradient;
  } else {
    gradient.addColorStop(0, `rgba(7, 29, 73, ${opacity})`);
    gradient.addColorStop(0.6, `rgba(7, 29, 73, ${opacity * 0.42})`);
    gradient.addColorStop(1, "rgba(7, 29, 73, 0)");
    ctx.fillStyle = gradient;
  }

  ctx.fillRect(0, 0, width, height);
}

function measureWith(ctx: CanvasRenderingContext2D, family: string) {
  return (text: string, size: number, weight: string) => {
    ctx.font = `${weight} ${size}px ${family}`;
    return ctx.measureText(text).width;
  };
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: { text: string }[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => {
    ctx.fillText(line.text, x, y + index * lineHeight);
  });
}

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: LayoutBox,
  options: {
    color: string;
    align: CanvasTextAlign;
    maxSize: number;
    minSize: number;
    weight: string;
    maxHeightRatio: number;
    uppercase?: boolean;
  },
) {
  const copy = options.uppercase ? text.toUpperCase() : text;
  const fit = fitTextToBox({
    text: copy,
    maxWidth: box.width,
    maxHeight: Math.round(box.height * options.maxHeightRatio),
    maxFontSize: options.maxSize,
    minFontSize: options.minSize,
    fontWeight: options.weight,
    measure: measureWith(ctx, defaultBrandKit.typography.headline),
  });
  const x = options.align === "center" ? box.x + box.width / 2 : box.x;

  ctx.textBaseline = "top";
  ctx.textAlign = options.align;
  ctx.fillStyle = options.color;
  ctx.font = `${options.weight} ${fit.fontSize}px ${defaultBrandKit.typography.headline}`;
  drawLines(ctx, fit.lines, x, box.y, fit.lineHeight);

  return box.y + fit.lines.length * fit.lineHeight;
}

function drawSupport(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  maxHeight: number,
  color: string,
  align: CanvasTextAlign,
  size: number,
) {
  const fit = fitTextToBox({
    text,
    maxWidth: width,
    maxHeight,
    maxFontSize: size,
    minFontSize: Math.round(size * 0.78),
    fontWeight: "700",
    measure: measureWith(ctx, defaultBrandKit.typography.body),
  });
  const textX = align === "center" ? x + width / 2 : x;

  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  ctx.font = `700 ${fit.fontSize}px ${defaultBrandKit.typography.body}`;
  drawLines(ctx, fit.lines, textX, y, fit.lineHeight);

  return y + fit.lines.length * fit.lineHeight;
}

function drawOfferBadge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, unit: number, variant: "pill" | "tag" | "ribbon", scale = 1) {
  let fontSize = Math.round(unit * 0.045 * scale);
  while (fontSize > unit * 0.03) {
    ctx.font = `900 ${fontSize}px ${defaultBrandKit.typography.body}`;
    if (ctx.measureText(text).width + fontSize * 1.9 <= maxWidth) break;
    fontSize -= 1;
  }
  ctx.font = `900 ${fontSize}px ${defaultBrandKit.typography.body}`;
  const width = Math.min(ctx.measureText(text).width + fontSize * 1.9, maxWidth);
  const height = fontSize * 2.05;

  ctx.save();
  shadow(ctx, "rgba(0, 155, 122, 0.32)", unit * 0.025, unit * 0.01);
  if (variant === "ribbon") {
    ctx.fillStyle = brand.warm;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - height * 0.35, y + height / 2);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = variant === "tag" ? brand.warm : brand.green700;
    drawRoundedRect(ctx, x, y, width, height, variant === "tag" ? unit * 0.014 : height / 2);
    ctx.fill();
  }
  clearShadow(ctx);
  ctx.fillStyle = variant === "tag" ? brand.blue950 : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.restore();

  return { width, height };
}

function drawCta(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, unit: number, variant: "solid" | "light" | "dark") {
  let fontSize = Math.round(unit * 0.048);
  while (fontSize > unit * 0.032) {
    ctx.font = `900 ${fontSize}px ${defaultBrandKit.typography.body}`;
    if (ctx.measureText(text).width + fontSize * 2.3 <= maxWidth) break;
    fontSize -= 1;
  }
  ctx.font = `900 ${fontSize}px ${defaultBrandKit.typography.body}`;
  const width = Math.min(ctx.measureText(text).width + fontSize * 2.3, maxWidth);
  const height = fontSize * 2.25;
  const radius = Math.round(height * 0.28);

  ctx.save();
  shadow(ctx, "rgba(7, 94, 214, 0.34)", unit * 0.03, unit * 0.012);
  ctx.fillStyle = variant === "light" ? "#ffffff" : variant === "dark" ? brand.blue950 : brand.blue700;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = variant === "light" ? brand.blue950 : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.strokeStyle = variant === "light" ? "rgba(7, 94, 214, 0.18)" : "rgba(255,255,255,0.28)";
  ctx.lineWidth = Math.max(2, unit * 0.004);
  drawRoundedRect(ctx, x + 3, y + 3, width - 6, height - 6, radius - 3);
  ctx.stroke();
  ctx.restore();

  return { width, height };
}

function drawBenefitChips(ctx: CanvasRenderingContext2D, benefits: string[], x: number, y: number, maxWidth: number, unit: number, theme: "light" | "dark") {
  const fontSize = Math.round(unit * 0.03);
  const gap = Math.round(unit * 0.014);
  let cursorX = x;
  let cursorY = y;
  const height = Math.round(fontSize * 1.95);

  benefits.forEach((benefit) => {
    ctx.font = `800 ${fontSize}px ${defaultBrandKit.typography.body}`;
    const chipWidth = Math.min(ctx.measureText(benefit).width + height * 1.9, maxWidth);
    if (cursorX + chipWidth > x + maxWidth) {
      cursorX = x;
      cursorY += height + gap;
    }

    ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)";
    drawRoundedRect(ctx, cursorX, cursorY, chipWidth, height, height / 2);
    ctx.fill();
    ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.28)" : "rgba(7, 94, 214, 0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const iconX = cursorX + height * 0.48;
    const iconY = cursorY + height / 2;
    ctx.strokeStyle = theme === "dark" ? brand.green500 : brand.green700;
    ctx.lineWidth = Math.max(3, unit * 0.004);
    ctx.beginPath();
    ctx.moveTo(iconX - height * 0.14, iconY);
    ctx.lineTo(iconX - height * 0.02, iconY + height * 0.13);
    ctx.lineTo(iconX + height * 0.2, iconY - height * 0.16);
    ctx.stroke();

    ctx.fillStyle = theme === "dark" ? "#ffffff" : brand.blue950;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(benefit, cursorX + height * 0.9, iconY);
    cursorX += chipWidth + gap;
  });

  return cursorY + height;
}

function getLogoBox(position: CompositionSettings["logoPosition"], width: number, height: number, logo: HTMLImageElement, scale: number) {
  const unit = Math.min(width, height);
  const pad = Math.round(unit * 0.045);
  const logoWidth = Math.round(Math.min(width * scale, width * 0.28));
  const logoHeight = Math.round(logoWidth * (logo.height / logo.width));
  const xMap = {
    "top-left": pad,
    "bottom-left": pad,
    "top-center": (width - logoWidth) / 2,
    "bottom-center": (width - logoWidth) / 2,
    "top-right": width - logoWidth - pad,
    "bottom-right": width - logoWidth - pad,
  };
  const yMap = {
    "top-left": pad,
    "top-center": pad,
    "top-right": pad,
    "bottom-left": height - logoHeight - pad,
    "bottom-center": height - logoHeight - pad,
    "bottom-right": height - logoHeight - pad,
  };

  return { x: xMap[position], y: yMap[position], width: logoWidth, height: logoHeight };
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, settings: NormalizedSettings, width: number, height: number, light = true) {
  const unit = Math.min(width, height);
  const logoBox = getLogoBox(settings.logoPosition, width, height, logo, Math.max(settings.logoScale, 0.18));
  const pad = Math.round(logoBox.width * 0.075);

  ctx.save();
  shadow(ctx, "rgba(7, 29, 73, 0.18)", unit * 0.018, unit * 0.008);
  ctx.fillStyle = light ? "rgba(255,255,255,0.92)" : "rgba(7,29,73,0.82)";
  drawRoundedRect(ctx, logoBox.x - pad, logoBox.y - pad, logoBox.width + pad * 2, logoBox.height + pad * 2, unit * 0.014);
  ctx.fill();
  clearShadow(ctx);
  ctx.drawImage(logo, logoBox.x, logoBox.y, logoBox.width, logoBox.height);
  ctx.restore();
}

function drawAccentGeometry(ctx: CanvasRenderingContext2D, width: number, height: number, role: CompositionTemplate["role"]) {
  const unit = Math.min(width, height);
  ctx.save();
  ctx.globalAlpha = 0.92;
  if (role === "exam-success" || role === "subject-hero") {
    ctx.fillStyle = "rgba(25, 200, 156, 0.22)";
    ctx.beginPath();
    ctx.moveTo(width * 0.62, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.36);
    ctx.lineTo(width * 0.72, height * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = brand.green500;
    ctx.lineWidth = unit * 0.01;
    ctx.beginPath();
    ctx.moveTo(width * 0.64, height * 0.12);
    ctx.lineTo(width * 0.93, height * 0.04);
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.moveTo(width * 0.72, height * 0.08);
    ctx.lineTo(width * 0.96, height * 0.02);
    ctx.lineTo(width * 0.9, height * 0.22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawTextStack(
  ctx: CanvasRenderingContext2D,
  copy: NormalizedAdCopy,
  box: LayoutBox,
  unit: number,
  options: {
    align: CanvasTextAlign;
    headlineColor: string;
    supportColor: string;
    ctaVariant: "solid" | "light" | "dark";
    offerVariant: "pill" | "tag" | "ribbon";
    benefits?: boolean;
    uppercaseHeadline?: boolean;
    centerActions?: boolean;
    fontScale?: number;
    offerScale?: number;
  },
) {
  const actionX = options.centerActions ? box.x + box.width / 2 : box.x;
  const fontScale = options.fontScale ?? 1;
  const headlineEnd = drawHeadline(ctx, copy.headline, box, {
    color: options.headlineColor,
    align: options.align,
    maxSize: Math.round(unit * 0.09 * fontScale),
    minSize: Math.round(unit * 0.052 * Math.min(fontScale, 1.08)),
    weight: "900",
    maxHeightRatio: 0.42,
    uppercase: options.uppercaseHeadline,
  });
  const supportY = headlineEnd + unit * 0.024;
  const supportEnd = drawSupport(
    ctx,
    copy.support,
    box.x,
    supportY,
    box.width,
    Math.round(box.height * 0.18),
    options.supportColor,
    options.align,
    Math.round(unit * 0.038 * fontScale),
  );
  const benefitEnd = options.benefits
    ? drawBenefitChips(ctx, copy.benefits, box.x, supportEnd + unit * 0.026, box.width, unit, options.headlineColor === "#ffffff" ? "dark" : "light")
    : supportEnd;
  const offerY = benefitEnd + unit * 0.032;
  const offerSize = drawOfferBadge(
    ctx,
    copy.offer,
    options.centerActions ? actionX - box.width * 0.27 : box.x,
    offerY,
    box.width * (options.centerActions ? 0.54 : 0.78),
    unit,
    options.offerVariant,
    options.offerScale,
  );
  const ctaY = offerY + offerSize.height + unit * 0.026;

  drawCta(
    ctx,
    copy.cta,
    options.centerActions ? actionX - box.width * 0.3 : box.x,
    ctaY,
    box.width * (options.centerActions ? 0.6 : 0.82),
    unit,
    options.ctaVariant,
  );
}

function drawTemplateTreatment(ctx: CanvasRenderingContext2D, template: CompositionTemplate, width: number, height: number, textBox: LayoutBox, opacity: number) {
  const unit = Math.min(width, height);

  if (template.role === "full-bleed") {
    drawGradientOverlay(ctx, width, height, "bottom", 0.82);
    return;
  }

  if (template.role === "split-hero" || template.role === "local-service" || template.role === "subject-hero" || template.role === "exam-success") {
    const panelWidth = Math.min(width * 0.66, textBox.width + unit * 0.13);
    const gradient = ctx.createLinearGradient(0, 0, panelWidth, 0);
    gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
    gradient.addColorStop(0.78, `rgba(255,255,255,${opacity * 0.95})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, panelWidth, height);
    drawAccentGeometry(ctx, width, height, template.role);
    return;
  }

  if (template.role === "results-benefits") {
    const panel = { x: width * 0.045, y: height * 0.055, width: width * 0.91, height: height * 0.48 };
    ctx.save();
    shadow(ctx, "rgba(7, 29, 73, 0.16)", unit * 0.028, unit * 0.012);
    fillRounded(ctx, panel, `rgba(255,255,255,${opacity})`, unit * 0.026);
    ctx.restore();
    clearShadow(ctx);
    return;
  }

  const panel = {
    x: textBox.x - unit * 0.035,
    y: textBox.y - unit * 0.04,
    width: textBox.width + unit * 0.07,
    height: textBox.height + unit * 0.08,
  };
  ctx.save();
  shadow(ctx, "rgba(7, 29, 73, 0.16)", unit * 0.03, unit * 0.014);
  fillRounded(ctx, panel, `rgba(255,255,255,${opacity})`, unit * 0.025);
  ctx.restore();
  clearShadow(ctx);
}

function drawLocationBadge(ctx: CanvasRenderingContext2D, location: string, x: number, y: number, unit: number) {
  const text = `IN ${location.toUpperCase()}`;
  const fontSize = Math.round(unit * 0.032);
  ctx.font = `900 ${fontSize}px ${defaultBrandKit.typography.body}`;
  const width = ctx.measureText(text).width + fontSize * 1.7;
  const height = fontSize * 1.9;

  ctx.fillStyle = brand.blue950;
  drawRoundedRect(ctx, x, y, width, height, height / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + height / 2);
}

function drawSubjectKicker(ctx: CanvasRenderingContext2D, copy: NormalizedAdCopy, box: LayoutBox, unit: number, role: CompositionTemplate["role"]) {
  if (role !== "subject-hero" && role !== "exam-success") return;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `900 ${Math.round(unit * 0.052)}px ${defaultBrandKit.typography.headline}`;
  ctx.fillStyle = role === "exam-success" ? brand.green700 : brand.blue700;
  ctx.fillText(copy.subject.toUpperCase(), box.x, box.y - unit * 0.025);
  ctx.fillStyle = "rgba(7, 94, 214, 0.12)";
  ctx.font = `900 ${Math.round(unit * 0.18)}px ${defaultBrandKit.typography.headline}`;
  ctx.fillText(copy.subject.toUpperCase(), box.x - unit * 0.01, box.y + box.height * 0.46);
  ctx.restore();
}

export function drawComposedAd(payload: ComposePayload) {
  const { canvas, background, logo, campaign, format } = payload;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not available.");
  }

  canvas.width = format.width;
  canvas.height = format.height;

  const template = getCompositionTemplate(payload.settings.templateId);
  const settings = normalizeSettings(payload.settings, template);
  const copy = normalizeAdCopy(campaign);
  const unit = Math.min(format.width, format.height);
  const textBox = getTextBox(template.id, format.width, format.height);

  ctx.clearRect(0, 0, format.width, format.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, format.width, format.height);
  drawCoverImage(ctx, background, format.width, format.height, settings);
  drawTemplateTreatment(ctx, template, format.width, format.height, textBox, settings.overlayOpacity);

  if (template.role === "full-bleed") {
    drawLogo(ctx, logo, settings, format.width, format.height, true);
    drawTextStack(ctx, copy, textBox, unit, {
      align: "left",
      headlineColor: "#ffffff",
      supportColor: "rgba(255,255,255,0.9)",
      ctaVariant: "light",
      offerVariant: "tag",
      fontScale: settings.fontScale,
      offerScale: settings.offerScale,
    });
    return;
  }

  if (template.role === "results-benefits") {
    drawLogo(ctx, logo, settings, format.width, format.height, true);
    drawTextStack(ctx, copy, textBox, unit, {
      align: "center",
      headlineColor: brand.blue950,
      supportColor: "#334155",
      ctaVariant: "solid",
      offerVariant: "pill",
      benefits: true,
      centerActions: true,
      fontScale: settings.fontScale,
      offerScale: settings.offerScale,
    });
    return;
  }

  if (template.role === "local-service") {
    drawLocationBadge(ctx, copy.location, textBox.x, textBox.y - unit * 0.07, unit);
  }

  drawLogo(ctx, logo, settings, format.width, format.height, true);
  drawSubjectKicker(ctx, copy, textBox, unit, template.role);
  drawTextStack(ctx, copy, textBox, unit, {
    align: template.textPosition === "center" ? "center" : "left",
    headlineColor: brand.blue950,
    supportColor: "#26384f",
    ctaVariant: template.role === "premium-minimal" ? "dark" : "solid",
    offerVariant: template.role === "exam-success" ? "ribbon" : template.role === "premium-minimal" ? "tag" : "pill",
    benefits: template.useBenefits,
    uppercaseHeadline: template.emphasizeSubject,
    centerActions: template.textPosition === "center",
    fontScale: settings.fontScale,
    offerScale: settings.offerScale,
  });

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${Math.round(unit * 0.02)}px ${defaultBrandKit.typography.body}`;
  ctx.fillStyle = "rgba(7, 29, 73, 0.68)";
  ctx.fillText(defaultBrandKit.tagline, Math.round(format.width * 0.055), format.height - Math.round(format.height * 0.04));
}
