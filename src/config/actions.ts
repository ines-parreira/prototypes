import {ShopifyActionType} from '../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'

export const actions = [
    {
        name: ShopifyActionType.RefundShippingCostOfOrder,
        label: 'Refund shipping cost of order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.CancelOrder,
        label: 'Cancel order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.RefundOrder,
        label: 'Refund order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.FullRefundOrder,
        label: 'Full refund order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.CreateOrder,
        label: 'Create order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.DuplicateOrder,
        label: 'Duplicate order',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.SendDraftOrderInvoice,
        label: 'Send invoice for draft order',
        objectType: 'draftOrder',
    },
    {
        name: ShopifyActionType.PartialRefundOrder,
        label: 'Partial refund order',
        objectType: 'order',
    },
    {
        name: 'rechargeCancelSubscription',
        label: 'Cancel subscription',
        objectType: 'subscription',
    },
    {
        name: 'rechargeActivateSubscription',
        label: 'Activate subscription',
        objectType: 'subscription',
    },
    {
        name: 'rechargeSkipCharge',
        label: 'Skip charge',
        objectType: 'charge',
    },
    {
        name: 'rechargeUnskipCharge',
        label: 'Unskip charge',
        objectType: 'charge',
    },
    {
        name: 'rechargeRefundCharge',
        label: 'Refund charge',
        objectType: 'charge',
    },
    {
        name: 'rechargeRefundOrder',
        label: 'Refund order',
        objectType: 'order',
    },
    {
        name: 'facebookPrivateReply',
        label: 'Replied via',
        objectType: 'message',
    },
    {
        name: 'instagramPrivateReply',
        label: 'Replied via',
        objectType: 'message',
    },
]

export const getActionByName = (name: string) => {
    return actions.find((action) => action.name === name)
}
