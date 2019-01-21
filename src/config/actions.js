export const actions = [{
    name: 'shopifyRefundShippingCostOfOrder',
    label: 'Refund shipping cost of order',
    objectType: 'order',
}, {
    name: 'shopifyCancelOrder',
    label: 'Cancel order',
    objectType: 'order',
}, {
    name: 'shopifyFullRefundOrder',
    label: 'Full refund order',
    objectType: 'order',
}, {
    name: 'shopifyDuplicateOrder',
    label: 'Duplicate order',
    objectType: 'order',
}, {
    name: 'shopifyPartialRefundOrder',
    label: 'Partial refund order',
    objectType: 'order',
}, {
    name: 'shopifyRefundOrderItem',
    label: 'Refund item',
    objectType: 'item',
}, {
    name: 'shopifyDuplicateOrder',
    label: 'Duplicate order',
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
}]

export const getActionByName = (name) => {
    return actions.find(action => action.name === name)
}
