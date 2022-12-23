import {attachSearchParamsToUrl} from 'utils/url'

import {CampaignProduct} from '../types/CampaignProduct'

const ACCOUNTS_WITHOUT_UTM = ['iliabeauty']

export function shouldAppendUtmParam(): boolean {
    const [account] = window.location.hostname.split('.')

    return !ACCOUNTS_WITHOUT_UTM.some((merchant) => account === merchant)
}

export function attachUtmToCampaignProduct(
    product: CampaignProduct,
    campaignName: string
): string {
    if (!shouldAppendUtmParam()) {
        return product.url
    }

    return attachSearchParamsToUrl(product.url, {
        utm_source: 'Gorgias',
        utm_medium: 'ChatCampaign',
        utm_campaign: campaignName,
    })
}
