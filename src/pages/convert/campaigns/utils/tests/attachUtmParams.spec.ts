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
const MOCK_UTM_QUERY_STRING = ''
const MOCK_UTM_ENABLED = true

describe('shouldAppendUtmParam', () => {
    it('returns false only for exact excepted merchants', () => {
        expect(shouldAppendUtmParam(true)).toEqual(true)

        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueDisableUtmParams]: true,
        })
        expect(shouldAppendUtmParam(true)).toEqual(false)
    })

    it('returns false if utm is not enabled', () => {
        expect(shouldAppendUtmParam(true, false)).toEqual(false)
    })
})

describe('attachUtmToCampaignProduct', () => {
    describe(`merchant doesn't accept UTM in the links`, () => {
        it('returns the original product url', () => {
            allFlagsMock.mockReturnValue({
                [FeatureFlagKey.RevenueDisableUtmParams]: true,
            })
            expect(
                attachUtmToCampaignProduct(
                    MOCK_PRODUCT,
                    MOCK_CAMPAIGN_NAME,
                    true,
                    MOCK_UTM_ENABLED,
                    MOCK_UTM_QUERY_STRING
                )
            ).toEqual(MOCK_PRODUCT.url)
        })
    })

    it('adds the source, medium and campaign UTMs', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.RevenueDisableUtmParams]: false,
        })

        const campaignNameConcat = MOCK_CAMPAIGN_NAME.replace(' ', '%20')
        const expectedFullUrl = `${MOCK_PRODUCT.url}?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignNameConcat}`

        expect(
            attachUtmToCampaignProduct(
                MOCK_PRODUCT,
                MOCK_CAMPAIGN_NAME,
                true,
                MOCK_UTM_ENABLED,
                MOCK_UTM_QUERY_STRING
            )
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

        const campaignNameConcat = MOCK_CAMPAIGN_NAME.replace(' ', '%20')
        const expectedFullUrl = `${MOCK_PRODUCT.url}?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignNameConcat}`

        expect(
            replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME, true, false)
        ).toEqual(`<p><a href="${expectedFullUrl}">Mock product</a></p>`)
    })

    it('does not replace the url if the merchant does not accept utm params', () => {
        allFlagsMock.mockReturnValueOnce({
            [FeatureFlagKey.RevenueDisableUtmParams]: true,
        })

        const html = `<p><a href="${MOCK_PRODUCT.url}">Mock product</a></p>`

        expect(
            replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME, true, false)
        ).toEqual(html)
    })

    it('should skip replacing completly if the canAddUtm flag is true', () => {
        const html = `<p><a href="${MOCK_PRODUCT.url}">Mock product</a></p>`

        expect(
            replaceUrlsWithUtmUrl(html, MOCK_CAMPAIGN_NAME, true, true)
        ).toEqual(html)
    })
})
