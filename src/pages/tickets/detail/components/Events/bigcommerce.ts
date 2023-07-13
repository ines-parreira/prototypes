import {fromJS, List} from 'immutable'
import {BigCommerceActionType} from 'models/integration/types'
import {eventMaker} from './types'

const bigCommerceEvent = ({
    integration,
    actionConfig,
    payload,
    data,
}: eventMaker) => {
    const _getOrder = (checkoutId: string) => {
        const draftOrders = (data.get('draft_orders') ||
            fromJS([])) as List<any>
        const orders = (data.get('orders') || fromJS([])) as List<any>
        const allOrders = draftOrders.concat(orders)
        return (allOrders.find(
            (order: Map<any, any>) =>
                (order.get('cart_id') as string) === checkoutId
        ) || fromJS({})) as Map<any, any>
    }

    const action = actionConfig.name
    const shopName = integration.getIn(['meta', 'store_hash']) as string

    if (action === BigCommerceActionType.RefundOrder) {
        const orderId = payload.get('bigcommerce_order_id')

        if (!orderId) {
            return
        }

        return {
            objectLabel: `#${orderId as string}`,
            objectLink: `https://store-${shopName}.mybigcommerce.com/manage/orders/${
                orderId as string
            }`,
        }
    }

    if (
        [
            BigCommerceActionType.CreateOrder,
            BigCommerceActionType.DuplicateOrder,
        ].includes(action as BigCommerceActionType)
    ) {
        const checkoutId = payload.get('bigcommerce_checkout_id')
        const order = _getOrder(checkoutId)
        const orderId = order.get('id')

        if (!orderId) {
            return
        }

        return {
            objectLabel: `#${orderId as string}`,
            objectLink: `https://store-${shopName}.mybigcommerce.com/manage/orders/${
                orderId as string
            }`,
        }
    }
}

export default bigCommerceEvent
