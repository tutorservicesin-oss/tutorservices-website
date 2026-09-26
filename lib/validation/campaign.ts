import type { CampaignInput } from "@/lib/campaign";
import { adFormats } from "@/lib/formats";
import { visualStyles } from "@/lib/styles";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateCampaign(campaign: CampaignInput): ValidationResult {
  const errors: string[] = [];

  if (!campaign.campaignName.trim()) errors.push("Campaign name is required.");
  if (!campaign.advertising.trim()) errors.push("Advertising focus is required.");
  if (!campaign.headline.trim()) errors.push("Headline is required.");
  if (!campaign.description.trim()) errors.push("Description is required.");
  if (!campaign.offer.trim()) errors.push("Offer is required.");
  if (!campaign.cta.trim()) errors.push("Call to action is required.");
  if (!campaign.location.trim()) errors.push("Location is required.");
  if (campaign.audience === "Custom" && !campaign.customAudience.trim()) errors.push("Custom audience is required.");
  if (campaign.subject === "Other" && !campaign.customSubject.trim()) errors.push("Custom subject is required.");
  if (!adFormats.some((format) => format.id === campaign.formatId)) errors.push("Select a valid ad format.");
  if (!visualStyles.some((style) => style.id === campaign.styleId)) errors.push("Select a valid visual style.");

  return {
    valid: errors.length === 0,
    errors,
  };
}
