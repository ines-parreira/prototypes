import {fetchIntegrationProducts} from 'state/integrations/helpers'
import {Product as ShopifyProduct} from 'constants/integrations/types/shopify'

export async function checkShopifyProductAvailabity(
    integrationId: number,
    productId: number
): Promise<boolean> {
    const products = await fetchIntegrationProducts(integrationId, [productId])

    if (!products) {
        return true
    }

    const product = products[0].toJS() as ShopifyProduct
    const isTracked = product.variants.every(
        (variant) => !!variant.inventory_management
    )
    const quantity = product.variants.reduce(
        (total, variant) => total + variant.inventory_quantity,
        0
    )

    return isTracked ? quantity !== 0 : true
}
