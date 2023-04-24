import {shouldAppendUtmParam} from '../attachUtmParams'
import {transformProductToAttachment} from '../transformProductToAttachment'

jest.mock('../attachUtmParams')

const PRODUCT_WITH_CURRENCY = {
    id: 7684488200358,
    title: 'Fanboy subscription',
    url: 'https://robertpmf.myshopify.com/products/fanboy-subscription?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=Test+1',
    price: 0,
    currency: 'USD',
    featured_image:
        'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/unnamed.jpg?v=1675942346',
}

const PRODUCT_WITHOUT_CURRENCY = {
    id: 7684488200358,
    title: 'Fanboy subscription',
    url: 'https://robertpmf.myshopify.com/products/fanboy-subscription?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=Test+1',
    price: 0,
    featured_image:
        'https://cdn.shopify.com/s/files/1/0572/7505/6294/products/unnamed.jpg?v=1675942346',
}

describe('transformProductToAttachment()', () => {
    it('adds the currency code if product is missing it', () => {
        ;(shouldAppendUtmParam as jest.Mock).mockImplementation(() => true)
        expect(
            transformProductToAttachment(PRODUCT_WITHOUT_CURRENCY, {
                campaignName: 'Test 1',
                currency: 'GBP',
            })
        ).toMatchSnapshot()
        expect(
            transformProductToAttachment(PRODUCT_WITH_CURRENCY, {
                campaignName: 'Test 1',
                currency: 'GBP',
            })
        ).toMatchSnapshot()
    })
})
