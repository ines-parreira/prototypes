import { BigCommerceActionType } from '../models/integration/types'
import { ShopifyActionType } from '../Widgets/modules/Shopify/types'

export const INFOBAR_CUSTOM_BUTTON_ACTION_NAME = 'customHttpAction'

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
        name: ShopifyActionType.UpdateOrderTags,
        label: 'Edit order tags',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.UpdateCustomerTags,
        label: 'Edit customer tags',
        objectType: 'customer',
    },
    {
        name: ShopifyActionType.EditOrder,
        label: 'Edit order ',
        objectType: 'order',
    },
    {
        name: ShopifyActionType.EditShippingAddress,
        label: 'Edit Shipping address ',
        objectType: 'address',
    },
    {
        name: ShopifyActionType.ShopifyEditNoteOfOrder,
        label: 'Edit note of order',
        objectType: 'order',
    },
    {
        name: BigCommerceActionType.CreateOrder,
        label: 'Create Order',
        objectType: 'order',
    },
    {
        name: BigCommerceActionType.DuplicateOrder,
        label: 'Duplicate Order',
        objectType: 'order',
    },
    {
        name: BigCommerceActionType.RefundOrder,
        label: 'Refund Order',
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
    {
        name: INFOBAR_CUSTOM_BUTTON_ACTION_NAME,
        label: 'Custom HTTP Action',
        objectType: 'http',
    },
]

export const getActionByName = (name: string) => {
    return actions.find((action) => action.name === name)
}
