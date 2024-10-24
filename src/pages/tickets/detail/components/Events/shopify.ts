import {fromJS, List} from 'immutable'

import {shopifyAdminBaseUrl} from 'config/integrations/shopify'

import {eventMaker} from './types'

const shopifyEvent = ({
    integration,
    actionConfig,
    payload,
    data,
}: eventMaker) => {
    const _getOrder = (orderId: number) => {
        return (((data.get('orders') || fromJS([])) as List<any>).find(
            (order: Map<any, any>) =>
                (order.get('id') as number).toString() === orderId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    const _getItem = (orderId: number, itemId: number) => {
        const order = _getOrder(orderId)
        return (((order.get('line_items') || fromJS([])) as List<any>).find(
            (item: Map<any, any>) =>
                (item.get('id') as number).toString() === itemId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    const shopName = integration.getIn(['meta', 'shop_name']) as string
    const orderId = payload.get('order_id')
    if (actionConfig.objectType === 'draftOrder') {
        return {
            objectLabel: payload.get('draft_order_name'),
            objectLink: `${shopifyAdminBaseUrl(shopName)}/draft_orders/${
                payload.get('draft_order_id') as number
            }`,
        }
    } else if (orderId) {
        const order = _getOrder(orderId)

        if (actionConfig.objectType === 'order') {
            return {
                objectLabel: order.get('name'),
                objectLink: `${shopifyAdminBaseUrl(shopName)}/orders/${
                    order.get('id') as number
                }`,
            }
        } else if (actionConfig.objectType === 'item') {
            const item = _getItem(
                payload.get('order_id'),
                payload.get('item_id')
            )
            return {
                objectLabel: `${payload.get('quantity') as number} × ${
                    item.get('name') as string
                }`,
                objectLink: `${shopifyAdminBaseUrl(shopName)}/orders/${
                    order.get('id') as number
                }`,
            }
        }
    }
}

export default shopifyEvent
