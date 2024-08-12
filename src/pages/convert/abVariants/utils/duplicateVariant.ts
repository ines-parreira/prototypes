import {ulid} from 'ulidx'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

const fromVariant = (
    variants: CampaignVariant[],
    variantId: string
): CampaignVariant | undefined => {
    const variantIdx = variants.findIndex((item) => item.id === variantId)

    if (variantIdx < 0) {
        return undefined
    }

    return {
        id: ulid(),
        message_html: variants[variantIdx].message_html,
        message_text: variants[variantIdx].message_text,
        attachments: variants[variantIdx].attachments,
    }
}

const fromControlVersion = (campaign: Campaign): CampaignVariant => {
    return {
        id: ulid(),
        message_html: campaign.message_html,
        message_text: campaign.message_text,
        attachments: campaign.attachments,
    }
}

export const duplicateVariant = (
    currentVariants: CampaignVariant[],
    campaign: Campaign,
    variantId: string | null
): [string | undefined, CampaignVariant[]] => {
    const variants = [...currentVariants]

    let newVariant = null
    if (variantId === null) {
        newVariant = fromControlVersion(campaign)
    } else {
        newVariant = fromVariant(variants, variantId)
    }

    if (newVariant === undefined) {
        return [undefined, []]
    }

    variants.push(newVariant)

    return [newVariant.id as string, variants]
}
