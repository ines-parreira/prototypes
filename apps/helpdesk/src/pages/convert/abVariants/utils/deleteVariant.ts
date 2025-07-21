import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'

export const deleteVariant = (
    currentVariants: CampaignVariant[],
    variantId: string,
): CampaignVariant[] | undefined => {
    const variants = [...currentVariants]
    const variantIdx = variants.findIndex((item) => item.id === variantId)

    if (variantIdx < 0) {
        return undefined
    }

    variants.splice(variantIdx, 1)

    return variants
}
