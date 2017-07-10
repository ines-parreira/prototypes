export const actions = [{
    name: 'shopifyRefundShippingCostOfOrder',
    label: 'Refund shipping cost of order',
}, {
    name: 'shopifyCancelOrder',
    label: 'Cancel order',
}, {
    name: 'shopifyFullRefundOrder',
    label: 'Full refund order',
}, {
    name: 'shopifyDuplicateOrder',
    label: 'Duplicate order',
}, {
    name: 'shopifyRefundOrderItem',
    label: 'Refund item',
}, {
    name: 'rechargeCancelSubscription',
    label: 'Cancel subscription'
}]

export const getActionByName = (name) => {
    return actions.find(action => action.name === name)
}
