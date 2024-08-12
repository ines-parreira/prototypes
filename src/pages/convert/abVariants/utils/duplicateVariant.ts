import {ulid} from 'ulidx'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

export const duplicateVariant = (
    currentVariants: CampaignVariant[],
    variantId: string
): [string | undefined, CampaignVariant[]] => {
    const variants = [...currentVariants]
    const variantIdx = variants.findIndex((item) => item.id === variantId)

    if (variantIdx < 0) {
        return [undefined, []]
    }

    const newVariantId = ulid()
    variants.push({
        id: newVariantId,
        message_html: variants[variantIdx].message_html,
        message_text: variants[variantIdx].message_text,
        attachments: variants[variantIdx].attachments,
    })

    return [newVariantId, variants]
}
