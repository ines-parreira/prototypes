import {attachSearchParamsToUrl} from 'utils/url'
import {getLDClient} from 'utils/launchDarkly'

import {FeatureFlagKey} from 'config/featureFlags'

import {CampaignProduct} from '../types/CampaignProduct'

import {extractLinksFromText} from './extractLinksFromText'

export function isRevenueAddonSubscriber() {
    return Boolean(getLDClient().allFlags()[FeatureFlagKey.RevenueBetaTesters])
}

export function shouldAppendUtmParam(): boolean {
    const shouldDisableUtmParams = Boolean(
        getLDClient().allFlags()[FeatureFlagKey.RevenueDisableUtmParams]
    )

    return isRevenueAddonSubscriber() && !shouldDisableUtmParams
}

export function removeRevenueUtmFromUrl(url: string): string {
    const urlInstance = new URL(decodeURI(url))

    urlInstance.searchParams.delete('utm_source')
    urlInstance.searchParams.delete('utm_medium')
    urlInstance.searchParams.delete('utm_campaign')

    return decodeURI(urlInstance.toString())
}

export function attachUtmToCampaignProduct(
    product: CampaignProduct,
    campaignName: string
): string {
    if (shouldAppendUtmParam()) {
        return attachSearchParamsToUrl(product.url, {
            utm_source: 'Gorgias',
            utm_medium: 'ChatCampaign',
            utm_campaign: campaignName,
        })
    }

    return removeRevenueUtmFromUrl(product.url)
}

export function replaceUrlsWithUtmUrl(html: string, campaignName: string) {
    let output = html
    const links = extractLinksFromText(html)

    if (!isRevenueAddonSubscriber()) {
        return output
    }

    if (shouldAppendUtmParam()) {
        const linksWithUtm = links.map((url) =>
            attachSearchParamsToUrl(url, {
                utm_source: 'Gorgias',
                utm_medium: 'ChatCampaign',
                utm_campaign: campaignName,
            })
        )

        links.forEach((url, index) => {
            output = output.replace(url, linksWithUtm[index])
        })

        return output
    }

    links.forEach((url) => {
        output = output.replace(url, removeRevenueUtmFromUrl(url))
    })

    return output
}
