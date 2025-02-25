import { fromJS } from 'immutable'

import { AttachmentEnum } from 'common/types'
import { shopifyIntegration } from 'fixtures/integrations'
import { shopifyProductResult } from 'fixtures/shopify'
import { mapIntegrationToPickedShopifyIntegration } from 'pages/common/draftjs/plugins/toolbar/utils'

import { pickNRandomShopifyProducts } from '../pickNRandomShopifyProducts'

describe('pickNRandomShopifyProducts', () => {
    it('should return n random products from the given list of products', () => {
        // we do not test randomness, but the transformation of the products
        const products = [shopifyProductResult()[0]]

        const result = pickNRandomShopifyProducts(
            products as any,
            mapIntegrationToPickedShopifyIntegration(
                fromJS(shopifyIntegration),
            ),
            1,
        )

        expect(result).toEqual(
            expect.arrayContaining([
                {
                    content_type: AttachmentEnum.Product,
                    name: 'Black shirt',
                    size: 0,
                    url: 'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/black-shirt.jpg?v=1626170834',
                    extra: {
                        product_id: 1,
                        variant_id: 39923189874897,
                        price: '25.00',
                        variant_name: 'Black shirt',
                        product_link: 'https://shopify.myshopify.com/products/',
                        currency: 'EUR',
                        featured_image:
                            'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/black-shirt.jpg?v=1626170834',
                    },
                },
            ]),
        )
    })
})
