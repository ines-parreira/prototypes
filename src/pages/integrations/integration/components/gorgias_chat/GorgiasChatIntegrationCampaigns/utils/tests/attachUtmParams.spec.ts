import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import {CampaignProduct} from '../../types/CampaignProduct'

import {
    attachUtmToCampaignProduct,
    removeRevenueUtmFromUrl,
    shouldAppendUtmParam,
    replaceUrlsWithUtmUrl,
} from '../attachUtmParams'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({
    [FeatureFlagKey.RevenueBetaTesters]: true,
    [FeatureFlagKey.RevenueDisableUtmParams]: false,
})

const MOCK_PRODUCT: CampaignProduct = {
    id: 1,
    title: 'Mock product',
    url: 'https://store.com/mock-product/',
    price: 100,
    currency: 'USD',
    featured_image: 'https://store.com/mock-product.png',
}

const MOCK_CAMPAIGN_NAME = 'Jest Campaign'

describe('shouldAppendUtmParam', () => {
    it('returns false only for exact excepted merchants', () => {
        expect(shouldAppendUtmParam()).toEqual(true)

        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueBetaTesters]: true,
            [FeatureFlagKey.RevenueDisableUtmParams]: true,
        })
        expect(shouldAppendUtmParam()).toEqual(false)
    })
})

describe('attachUtmToCampaignProduct', () => {
    describe(`merchant doesn't accept UTM in the links`, () => {
        it('returns the original product url', () => {
            allFlagsMock.mockReturnValue({
                [FeatureFlagKey.RevenueBetaTesters]: true,
                [FeatureFlagKey.RevenueDisableUtmParams]: true,
            })
            expect(
                attachUtmToCampaignProduct(MOCK_PRODUCT, MOCK_CAMPAIGN_NAME)
            ).toEqual(MOCK_PRODUCT.url)
        })
    })

    it('adds the source, medium and campaign UTMs', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueBetaTesters]: true,
            [FeatureFlagKey.RevenueDisableUtmParams]: false,
        })

        const campaignNameConcat = MOCK_CAMPAIGN_NAME.replace(' ', '+')
        const expectedFullUrl = `${MOCK_PRODUCT.url}?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignNameConcat}`

        expect(
            attachUtmToCampaignProduct(MOCK_PRODUCT, MOCK_CAMPAIGN_NAME)
        ).toEqual(expectedFullUrl)
    })
})

describe('removeRevenueUtmFromUrl', () => {
    it('removes only the utm params', () => {
        expect(
            removeRevenueUtmFromUrl(
                'https://jest-store.myshopify.com/?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=JestCampaign&anotherParam=someValue'
            )
        ).toEqual('https://jest-store.myshopify.com/?anotherParam=someValue')
    })
})

describe('replaceUrlsWithUtmUrl', () => {
    it('replaces the url with the utm url', () => {
        const html = `<p><a href="${MOCK_PRODUCT.url}">Mock product</a></p>`

        const campaignNameConcat = MOCK_CAMPAIGN_NAME.replace(' ', '+')
        const expectedFullUrl = `${MOCK_PRODUCT.url}?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignNameConcat}`

        expect(replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME)).toEqual(
            `<p><a href="${expectedFullUrl}">Mock product</a></p>`
        )
    })

    it('does not replace the url if the merchant does not accept utm params', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueBetaTesters]: true,
            [FeatureFlagKey.RevenueDisableUtmParams]: true,
        })

        const html = `<p><a href="${MOCK_PRODUCT.url}">Mock product</a></p>`

        expect(replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME)).toEqual(html)
    })

    it('does not replace the url if the merchant is not in the beta', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueBetaTesters]: false,
            [FeatureFlagKey.RevenueDisableUtmParams]: false,
        })

        const html = `<p><a href="${MOCK_PRODUCT.url}">Mock product</a></p>`

        expect(replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME)).toEqual(html)
    })
})
