import {ShopifyMetafieldType} from '@gorgias/api-types'

const DEFAULT_SYMBOL = '$'

/**
 * With `short` option, we return `$` instead of `A$` (for any currency that includes a `$` in it).
 * `currencyCode` value is never render, it's the ID of a currency.
 */
export default function getShopifyMoneySymbol(
    currencyCode: string,
    short = false
): string {
    const formatter = new Intl.NumberFormat(window.navigator.language, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
    })
    const parts = formatter.formatToParts(1)
    const currencyPart = parts.find((part) => part.type === 'currency')
    const symbol = currencyPart ? currencyPart.value : DEFAULT_SYMBOL

    return short && symbol.includes(DEFAULT_SYMBOL) ? DEFAULT_SYMBOL : symbol
}

export function shortenUrl(url: string) {
    const result = url.replace(/(^\w+:|^)\/\//, '')
    return url
        ? result.length > 20
            ? `${result.slice(0, 20)}...`
            : result
        : undefined
}

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
            return `https://admin.shopify.com/store/${storeName}/products/${gid}`
        case 'list.collection_reference':
        case 'collection_reference':
            return `https://admin.shopify.com/store/${storeName}/collections/${gid}`
        case 'list.page_reference':
        case 'page_reference':
            return `https://admin.shopify.com/store/${storeName}/pages/${gid}`
        default: {
            return undefined
        }
    }
}
