import type { MetafieldType } from '@gorgias/helpdesk-types'

const shopifyAdminBaseUrl = (storeName: string): string =>
    `https://admin.shopify.com/store/${storeName}`

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
    type: MetafieldType | string,
    storeName: string,
    gid: string,
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
        case 'list.customer_reference':
        case 'customer_reference':
            return `${shopifyAdminBaseUrl(storeName)}/customers/${gid}`
        case 'list.company_reference':
        case 'company_reference':
            return `${shopifyAdminBaseUrl(storeName)}/companies/${gid}`
        default: {
            return undefined
        }
    }
}
