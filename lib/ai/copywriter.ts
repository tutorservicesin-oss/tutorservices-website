import type { CampaignInput } from "@/lib/campaign";
import type { CreativeCopy } from "@/lib/ai/schemas";

export function applyCreativeCopyToCampaign(campaign: CampaignInput, copy?: CreativeCopy): CampaignInput {
  if (!copy) return campaign;

  return {
    ...campaign,
    headline: copy.headline || campaign.headline,
    description: copy.subheadline || campaign.description,
    offer: copy.offer || campaign.offer,
    cta: copy.cta || campaign.cta,
  };
}
