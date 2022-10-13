import {ShopifyActionsState} from './shopify/types'
import {BigCommerceActionsState} from './bigcommerce/types'

export type InfobarActionsState = {
    shopify: ShopifyActionsState
    bigcommerce: BigCommerceActionsState
}
