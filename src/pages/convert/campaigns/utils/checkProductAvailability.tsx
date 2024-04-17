import {fetchIntegrationProducts} from 'state/integrations/helpers'
import {
    Product as ShopifyProduct,
    InventoryPolicy as ShopifyInventoryPolicy,
} from 'constants/integrations/types/shopify'

export function isProductAvailable(product: ShopifyProduct): boolean {
    const isTracked = product.variants.every(
        (variant) => !!variant.inventory_management
    )
    const quantity = product.variants.reduce(
        (total, variant) => total + variant.inventory_quantity,
        0
    )
    const variant = product.variants[0]

    return variant.inventory_policy === ShopifyInventoryPolicy.Deny && isTracked
        ? quantity > 0
        : true
}

export async function checkShopifyProductAvailabity(
    integrationId: number,
    productId: number
): Promise<boolean> {
    const products = await fetchIntegrationProducts(integrationId, [productId])

    if (!products) {
        return true
    }

    const product = products[0].toJS() as ShopifyProduct

    return isProductAvailable(product)
}
