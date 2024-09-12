import {fromJS} from 'immutable'
import {
    campaign as campaignFixture,
    campaignProductRecommendationAttachment,
} from 'fixtures/campaign'

import {getLDClient} from 'utils/launchDarkly'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'

import {createCampaignPayload} from '../createCampaignPayload'

jest.mock('utils/launchDarkly')

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
        shop_type: 'shopify',
    },
})

const MOCK_CAMPAIGN_PRODUCT: CampaignProduct = {
    id: 1,
    title: 'The Out of Stock Snowboard',
    url: 'https://shop-name.myshopify.com/products/product-name',
    price: 885.95,
    currency: 'USD',
    featured_image: 'https://cdn.shopify.com/',
}

const MOCK_CAMPAIGN_DISCOUNT: CampaignDiscountOffer = {
    prefix: 'Hello2024',
    id: '3',
}

describe('createCampaignPayload', () => {
    beforeAll(() => {
        const allFlagsMock = getLDClient().allFlags as jest.Mock
        allFlagsMock.mockReturnValue({})
    })

    it('returns campaign payload', () => {
        const campaign = {
            ...campaignFixture,
        } as Campaign

        const payload = createCampaignPayload({
            campaignData: campaign,
            triggers: campaign.triggers,
            isConvertSubscriber: true,
            chatMultiLanguagesEnabled: true,
            shopifyIntegration: integration,
            shopifyProducts: [],
            discountOffers: [],
            productRecommendations: [],
            canAddUtm: false,
            isActive: false,
            canChangeStatus: true,
            utmQueryString: '',
            utmEnabled: true,
        })

        expect(payload.status).toEqual('inactive')
        expect(payload.trigger_rule).toEqual(
            '{476ce50d-ac6f-4553-8400-b7ae0aad70c2}'
        )
    })

    it('returns campaign payload with products card and discount', () => {
        const campaign = {
            ...campaignFixture,
        } as Campaign

        const payload = createCampaignPayload({
            campaignData: campaign,
            triggers: campaign.triggers,
            isConvertSubscriber: true,
            chatMultiLanguagesEnabled: true,
            shopifyIntegration: integration,
            shopifyProducts: [MOCK_CAMPAIGN_PRODUCT],
            discountOffers: [MOCK_CAMPAIGN_DISCOUNT],
            productRecommendations: [campaignProductRecommendationAttachment],
            isActive: true,
            canChangeStatus: true,
            canAddUtm: false,
            utmQueryString: '',
            utmEnabled: true,
        })

        expect(payload.attachments).toEqual([
            {
                ...campaignProductRecommendationAttachment,
            },
            {
                contentType: 'application/discountOffer',
                extra: {
                    discount_offer_id: '3',
                    summary: undefined,
                },
                name: 'Hello2024',
            },
            {
                contentType: 'application/productCard',
                name: 'The Out of Stock Snowboard',
                size: 0,
                url: 'https://cdn.shopify.com/',
                extra: {
                    product_id: 1,
                    product_link:
                        'https://shop-name.myshopify.com/products/product-name?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=Welcome%20to%20the%20internet',
                    price: 885.95,
                    currency: 'USD',
                    position: undefined,
                    variant_name: undefined,
                },
            },
        ])
    })

    it('do not modify status if is in edit mode', () => {
        const campaign = {
            ...campaignFixture,
        } as Campaign

        const payload = createCampaignPayload({
            campaignData: campaign,
            triggers: campaign.triggers,
            isConvertSubscriber: true,
            chatMultiLanguagesEnabled: true,
            shopifyIntegration: integration,
            shopifyProducts: [MOCK_CAMPAIGN_PRODUCT],
            discountOffers: [MOCK_CAMPAIGN_DISCOUNT],
            productRecommendations: [campaignProductRecommendationAttachment],
            isActive: false,
            canChangeStatus: false,
            canAddUtm: false,
            utmQueryString: '',
            utmEnabled: true,
        })

        expect(payload.status).toEqual('active')
    })
})
