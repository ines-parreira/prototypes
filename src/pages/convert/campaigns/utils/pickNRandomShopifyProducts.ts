import {Map} from 'immutable'

import {Product} from 'constants/integrations/types/shopify'
import {IntegrationDataItem} from 'models/integration/types'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {
    transformProductCardDetailsToProductCardAttachment,
    transformShopifyProductToProductCardDetails,
} from 'pages/common/draftjs/plugins/toolbar/utils'

/*
 * This function picks n random products from the given list of products and transforms them into ProductCardAttachments.
 */
export const pickNRandomShopifyProducts = (
    products: IntegrationDataItem<Product>[],
    shopifyIntegration: Map<string, string>,
    n: number
): ProductCardAttachment[] => {
    const shuffled = products.sort(() => 0.5 - Math.random())
    return shuffled
        .slice(0, n)
        .map((product) =>
            transformProductCardDetailsToProductCardAttachment(
                transformShopifyProductToProductCardDetails(
                    product,
                    shopifyIntegration,
                    product.data.variants.length > 1
                )
            )
        )
}
