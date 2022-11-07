import {Map} from 'immutable'

export function chatIsShopifyStore(integration: Map<any, any>): boolean {
    const shop_type = integration.getIn(['meta', 'shop_type'], null)

    return shop_type === 'shopify'
}
