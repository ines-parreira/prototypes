import {CampaignProduct} from '../../types/CampaignProduct'

import {
    attachUtmToCampaignProduct,
    shouldAppendUtmParam,
} from '../attachUtmParams'

const MOCK_PRODUCT: CampaignProduct = {
    id: 1,
    title: 'Mock product',
    url: 'https://store.com/mock-product/',
    price: 100,
    currency: 'USD',
    featured_image: 'https://store.com/mock-product.png',
}

const MOCK_CAMPAIGN_NAME = 'Jest Campaign'

const ORIGINAL_HOSTNAME = 'acme.gorgias.docker'
const EXCEPTION_MERCHANT_HOSTNAME = 'iliabeauty.gorgias.docker'

describe('shouldAppendUtmParam', () => {
    it('returns false only for exact excepted merchants', () => {
        window.location.hostname = ORIGINAL_HOSTNAME
        expect(shouldAppendUtmParam()).toEqual(true)

        window.location.hostname = EXCEPTION_MERCHANT_HOSTNAME
        expect(shouldAppendUtmParam()).toEqual(false)

        // Check if a second domain that looks alike an exception is detected
        window.location.hostname = 'iliabeauty-clone.gorgias.docker'
        expect(shouldAppendUtmParam()).toEqual(true)
    })
})

describe('attachUtmToCampaignProduct', () => {
    describe(`merchant doesn't accept UTM in the links`, () => {
        beforeAll(() => {
            window.location.hostname = EXCEPTION_MERCHANT_HOSTNAME
        })

        it('returns the original product url', () => {
            expect(
                attachUtmToCampaignProduct(MOCK_PRODUCT, MOCK_CAMPAIGN_NAME)
            ).toEqual(MOCK_PRODUCT.url)
        })

        afterAll(() => {
            window.location.hostname = ORIGINAL_HOSTNAME
        })
    })

    it('adds the source, medium and campaign UTMs', () => {
        const campaignNameConcat = MOCK_CAMPAIGN_NAME.replace(' ', '+')
        const expectedFullUrl = `${MOCK_PRODUCT.url}?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignNameConcat}`

        expect(
            attachUtmToCampaignProduct(MOCK_PRODUCT, MOCK_CAMPAIGN_NAME)
        ).toEqual(expectedFullUrl)
    })
})
