import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import { attachSearchParamsToUrl } from '@repo/utils'
import { parse } from 'qs'

import type { CampaignProduct } from '../types/CampaignProduct'

export function shouldAppendUtmParam(
    isConvertSubscriber: boolean,
    utmEnabled: boolean = true,
): boolean {
    const shouldDisableUtmParams = Boolean(
        getLDClient().allFlags()[FeatureFlagKey.RevenueDisableUtmParams],
    )

    return isConvertSubscriber && !shouldDisableUtmParams && utmEnabled
}

export function removeRevenueUtmFromUrl(url: string): string {
    const urlInstance = new URL(decodeURI(url))

    urlInstance.searchParams.delete('utm_source')
    urlInstance.searchParams.delete('utm_medium')
    urlInstance.searchParams.delete('utm_campaign')
    urlInstance.searchParams.delete('utm_term')
    urlInstance.searchParams.delete('utm_content')

    return decodeURI(urlInstance.toString())
}

export function attachUtmToUrl(
    url: string,
    campaignName: string,
    isConvertSubscriber: boolean,
    utmEnabled: boolean = true,
    utmQueryString: string = '',
): string {
    if (shouldAppendUtmParam(isConvertSubscriber, utmEnabled)) {
        if (utmQueryString.length > 0) {
            const cleanUrl = removeRevenueUtmFromUrl(url)
            const { ...parameters } = parse(utmQueryString, {
                ignoreQueryPrefix: true,
            })
            return attachSearchParamsToUrl(
                cleanUrl,
                parameters as Record<string, string>,
            )
        }
        return attachSearchParamsToUrl(url, {
            utm_source: 'Gorgias',
            utm_medium: 'ChatCampaign',
            utm_campaign: campaignName,
        })
    }

    return url
}

export function attachUtmToCampaignProduct(
    product: CampaignProduct,
    campaignName: string,
    isConvertSubscriber: boolean,
    utmEnabled: boolean,
    utmQueryString: string,
): string {
    return attachUtmToUrl(
        product.url,
        campaignName,
        isConvertSubscriber,
        utmEnabled,
        utmQueryString,
    )
}
