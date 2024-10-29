import {fromJS} from 'immutable'

import {shopifyIntegration} from 'fixtures/integrations'
import {shopifyProductResult} from 'fixtures/shopify'

import {
    mapIntegrationToPickedShopifyIntegration,
    transformShopifyProductToProductCardDetails,
} from '../utils'

describe('toolbar utils functions', () => {
    describe('transformShopifyProductToProductCardDetails', () => {
        it('should transform shopify product into a product card details', () => {
            const product = shopifyProductResult()[1]
            // @ts-ignore to cover the case where the image is undefined
            product.data.image = undefined
            const result = transformShopifyProductToProductCardDetails(
                product as any,
                mapIntegrationToPickedShopifyIntegration(
                    fromJS(shopifyIntegration)
                ),
                false
            )

            expect(result).toMatchObject({
                compareAtPrice: '3999.99',
                currency: 'EUR',
                imageUrl: 'test-file-stub',
                link: 'https://shopify.myshopify.com/products/',
                price: '3310.00',
                productId: 6694863569105,
                productTitle: 'Strong phone',
                variantId: 39924461306065,
                variantTitle: undefined,
            })
        })
    })
})
