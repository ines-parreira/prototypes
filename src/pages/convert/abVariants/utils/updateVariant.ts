import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

export const updateVariant = (
    currentVariants: CampaignVariant[],
    campaign: Campaign,
    variantId: string
): CampaignVariant[] | undefined => {
    const variants = [...currentVariants]
    const variantIdx = variants.findIndex((item) => item.id === variantId)

    if (variantIdx < 0) {
        return undefined
    }

    variants[variantIdx] = {
        ...variants[variantIdx],
        message_html: campaign.message_html,
        message_text: campaign.message_text,
        attachments: campaign.attachments,
    }

    return variants
}
