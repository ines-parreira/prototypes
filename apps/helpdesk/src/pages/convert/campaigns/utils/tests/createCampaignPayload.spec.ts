import { fromJS } from 'immutable'

import {
    campaign as campaignFixture,
    campaignProductRecommendationAttachment,
} from 'fixtures/campaign'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import type { CampaignProduct } from 'pages/convert/campaigns/types/CampaignProduct'

import { createCampaignPayload } from '../createCampaignPayload'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{ language: 'en-US', primary: true }],
        shop_type: 'shopify',
    },
})

const MOCK_CAMPAIGN_PRODUCT: CampaignProduct = {
    id: 1,
    title: 'The Out of Stock Snowboard',
    url: 'https://shop-name.myshopify.com/products/product-name',
    price: 885.95,
    compareAtPrice: 999.95,
    currency: 'USD',
    featured_image: 'https://cdn.shopify.com/',
}

const MOCK_CAMPAIGN_DISCOUNT: CampaignDiscountOffer = {
    prefix: 'Hello2024',
    id: '3',
}

describe('createCampaignPayload', () => {
    const defaultProps = {
        campaignData: campaignFixture as Campaign,
        triggers: campaignFixture.triggers,
        isConvertSubscriber: true,
        chatMultiLanguagesEnabled: true,
        shopifyIntegration: integration,
        shopifyProducts: [],
        discountOffers: [],
        productRecommendations: [],
        contactForm: [],
        isActive: false,
        canChangeStatus: true,
        utmQueryString: '',
        utmEnabled: true,
    }

    it('returns campaign payload', () => {
        const payload = createCampaignPayload(defaultProps)

        expect(payload.status).toEqual('inactive')
        expect(payload.trigger_rule).toEqual(
            '{476ce50d-ac6f-4553-8400-b7ae0aad70c2}',
        )
    })

    it('returns campaign payload with products card and discount', () => {
        const payload = createCampaignPayload({
            ...defaultProps,
            shopifyIntegration: integration,
            shopifyProducts: [MOCK_CAMPAIGN_PRODUCT],
            discountOffers: [MOCK_CAMPAIGN_DISCOUNT],
            productRecommendations: [campaignProductRecommendationAttachment],
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
                    compare_at_price: 999.95,
                    currency: 'USD',
                    position: undefined,
                    variant_name: undefined,
                },
            },
        ])
    })

    it('do not modify status if is in edit mode', () => {
        const payload = createCampaignPayload({
            ...defaultProps,
            canChangeStatus: false,
        })

        expect(payload.status).toEqual('active')
    })

    describe('copySuggestion is handled properly', () => {
        it('do not add copySuggestion to payload if not set', () => {
            const campaign = {
                ...campaignFixture,
                meta: {
                    ...campaignFixture.meta,
                    copySuggestion: undefined,
                },
            } as Campaign

            const payload = createCampaignPayload({
                ...defaultProps,
                campaignData: campaign,
            })

            expect(payload.meta?.copySuggestion).toBeUndefined()
        })

        it('add copySuggestion to payload if it matches campaign message', () => {
            const suggestion = 'Hello, world! - was suggested'
            const campaign = {
                ...campaignFixture,
                message_text: suggestion,
                meta: {
                    ...campaignFixture.meta,
                    copySuggestion: suggestion,
                },
            } as Campaign

            const payload = createCampaignPayload({
                ...defaultProps,
                campaignData: campaign,
            })

            expect(payload.meta?.copySuggestion).toEqual(suggestion)
        })

        it('set copySuggestion to payload as null if campaign message changed too much', () => {
            const campaign = {
                ...campaignFixture,
                message_text: 'Welcome to the internet',
                meta: {
                    ...campaignFixture.meta,
                    copySuggestion: 'Hello, world! - was suggested',
                },
            } as Campaign

            const payload = createCampaignPayload({
                ...defaultProps,
                campaignData: campaign,
            })

            expect(payload.meta?.copySuggestion).toBeNull()
        })
    })
})
