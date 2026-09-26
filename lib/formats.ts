export type AdFormat = {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: string;
};

export const adFormats: AdFormat[] = [
  { id: "instagram-square", name: "Instagram Square", width: 1080, height: 1080, platform: "Instagram" },
  { id: "social-portrait", name: "Instagram/Facebook Portrait", width: 1080, height: 1350, platform: "Meta" },
  { id: "social-story", name: "Instagram/Facebook Story", width: 1080, height: 1920, platform: "Meta" },
  { id: "facebook-landscape", name: "Facebook Landscape", width: 1200, height: 628, platform: "Facebook" },
  { id: "google-display-landscape", name: "Google Display Landscape", width: 1200, height: 628, platform: "Google" },
  { id: "website-banner", name: "Website Banner", width: 1920, height: 1080, platform: "Website" },
  { id: "youtube-thumbnail", name: "YouTube Thumbnail", width: 1280, height: 720, platform: "YouTube" },
  { id: "whatsapp-status", name: "WhatsApp Status", width: 1080, height: 1920, platform: "WhatsApp" },
];

export function getAdFormat(formatId: string): AdFormat {
  const format = adFormats.find((item) => item.id === formatId);
  if (!format) {
    throw new Error(`Unknown ad format: ${formatId}`);
  }

  return format;
}
