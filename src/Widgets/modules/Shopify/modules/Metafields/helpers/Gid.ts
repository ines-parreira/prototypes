import {ShopifyMetafieldType} from '@gorgias/api-types'
import {shopifyAdminBaseUrl} from 'config/integrations/shopify'

export function extractGid(url: string) {
    if (!url) {
        return undefined
    }
    const segments = url.split('/')
    return segments && segments.length > 1
        ? segments[segments.length - 1]
        : undefined
}

export function prepareGidUrl(
    type: ShopifyMetafieldType,
    storeName: string,
    gid: string
) {
    switch (type) {
        case 'list.product_reference':
        case 'product_reference':
            return `${shopifyAdminBaseUrl(storeName)}/products/${gid}`
        case 'list.collection_reference':
        case 'collection_reference':
            return `${shopifyAdminBaseUrl(storeName)}/collections/${gid}`
        case 'list.page_reference':
        case 'page_reference':
            return `${shopifyAdminBaseUrl(storeName)}/pages/${gid}`
        default: {
            return undefined
        }
    }
}
