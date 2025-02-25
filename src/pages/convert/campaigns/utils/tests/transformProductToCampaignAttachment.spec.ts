import { fromJS } from 'immutable'

import { shopifyIntegration } from 'fixtures/integrations'
import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from 'fixtures/shopify'

import { transformProductToCampaignAttachment } from '../transformProductToCampaignAttachment'

describe('transformProductToCampaignAttachment', () => {
    it('should return a CampaignAttachment object', () => {
        const product = integrationDataItemProductFixture({
            data: shopifyProductFixture({
                variants: [
                    shopifyVariantFixture({
                        compareAtPrice: null,
                    }),
                ],
            }),
        })
        product.data.image = undefined

        const integration = shopifyIntegration
        // @ts-ignore
        integration.meta.currency = undefined

        const result = transformProductToCampaignAttachment(
            product,
            fromJS(shopifyIntegration),
        )

        expect(result).toMatchObject({
            url: 'test-file-stub',
            name: 'Product 1',
            contentType: 'application/productCard',
            size: 0,
            extra: {
                price: 9.99,
                currency: 'USD',
                product_link: 'https://shopify.myshopify.com/products/',
                product_id: 1,
            },
        })
    })
})
