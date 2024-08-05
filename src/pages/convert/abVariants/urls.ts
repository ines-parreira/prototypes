export const INTEGRATION_ID_PARAM = 'id'
export const CAMPAIGN_ID_PARAM = 'campaignId'
export const VARIANT_ID_PARAM = 'abVariantId'

export const abVariantsPath = `/app/convert/:${INTEGRATION_ID_PARAM}/campaigns/:${CAMPAIGN_ID_PARAM}/ab-variants`
export const abVariantsControlVersionPath = `${abVariantsPath}/control-variant`
export const abVariantEditorPath = `${abVariantsPath}/:${VARIANT_ID_PARAM}`
export const abVariantAddPath = `${abVariantsPath}/new`

export const abVariantsUrl = (
    integrationId: string,
    campaignId: string
): string => {
    return `/app/convert/${integrationId}/campaigns/${campaignId}/ab-variants`
}

export const abVariantControlVariantUrl = (
    integrationId: string,
    campaignId: string
): string => {
    return `${abVariantsUrl(integrationId, campaignId)}/control-variant`
}

export const abVariantEditorUrl = (
    integrationId: string,
    campaignId: string,
    variantId: string
): string => {
    return `${abVariantsUrl(integrationId, campaignId)}/${variantId}`
}

export const abVariantAddUrl = (
    integrationId: string,
    campaignId: string
): string => {
    return `${abVariantsUrl(integrationId, campaignId)}/add`
}
