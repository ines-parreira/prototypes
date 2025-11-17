import { ulid } from 'ulidx'

import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import type { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'

export const createVariant = (
    currentVariants: CampaignVariant[],
    data: Campaign,
): [string | undefined, CampaignVariant[]] => {
    const variants = [...currentVariants]
    const variantIdx = variants.findIndex((item) => !item.id)
    if (variantIdx < 0) {
        return [undefined, []]
    }

    const newVariantId = ulid()
    variants[variantIdx] = {
        id: newVariantId,
        message_html: data.message_html,
        message_text: data.message_text,
        attachments: data.attachments ? data.attachments : [],
    }

    return [newVariantId, variants]
}
