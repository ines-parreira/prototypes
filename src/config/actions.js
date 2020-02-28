import {
    ShopifyAction
} from '../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Order/constants'

export const actions = [{
    name: ShopifyAction.REFUND_SHIPPING_COST_OF_ORDER,
    label: 'Refund shipping cost of order',
    objectType: 'order',
}, {
    name: ShopifyAction.CANCEL_ORDER,
    label: 'Cancel order',
    objectType: 'order',
}, {
    name: ShopifyAction.FULL_REFUND_ORDER,
    label: 'Full refund order',
    objectType: 'order',
}, {
    name: ShopifyAction.DUPLICATE_ORDER,
    label: 'Duplicate order',
    objectType: 'order',
}, {
    name: ShopifyAction.SEND_DRAFT_ORDER_INVOICE,
    label: 'Send invoice for draft order',
    objectType: 'draftOrder',
}, {
    name: ShopifyAction.PARTIAL_REFUND_ORDER,
    label: 'Partial refund order',
    objectType: 'order',
}, {
    name: 'shopifyRefundOrderItem',
    label: 'Refund item',
    objectType: 'item',
}, {
//     name: 'shopifyCreateGiftCard',
//     label: 'Create gift card',
// }, {
    name: 'rechargeCancelSubscription',
    label: 'Cancel subscription',
    objectType: 'subscription',
}, {
    name: 'rechargeActivateSubscription',
    label: 'Activate subscription',
    objectType: 'subscription',
}, {
    name: 'rechargeSkipCharge',
    label: 'Skip charge',
    objectType: 'charge',
}, {
    name: 'rechargeUnskipCharge',
    label: 'Unskip charge',
    objectType: 'charge',
}, {
    name: 'rechargeRefundCharge',
    label: 'Refund charge',
    objectType: 'charge',
}, {
    name: 'rechargeRefundOrder',
    label: 'Refund order',
    objectType: 'order',
}]

export const getActionByName = (name) => {
    return actions.find((action) => action.name === name)
}
