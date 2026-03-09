import { assertNever } from '../../../../../utils/assertNever'
import type { ActionExecutedActionName } from './types'

function getDefaultActionLabel(actionName: ActionExecutedActionName): string {
    switch (actionName) {
        case 'shopifyRefundShippingCostOfOrder':
            return 'Refund shipping cost of order'
        case 'shopifyCancelOrder':
            return 'Cancel order'
        case 'shopifyRefundOrder':
            return 'Refund order'
        case 'shopifyFullRefundOrder':
            return 'Full refund order'
        case 'shopifyCreateOrder':
            return 'Create order'
        case 'shopifyDuplicateOrder':
            return 'Duplicate order'
        case 'shopifySendDraftOrderInvoice':
            return 'Send invoice for draft order'
        case 'shopifyPartialRefundOrder':
            return 'Partial refund order'
        case 'shopifyUpdateOrderTags':
            return 'Edit order tags'
        case 'shopifyUpdateCustomerTags':
            return 'Edit customer tags'
        case 'shopifyEditOrder':
            return 'Edit order'
        case 'shopifyEditShippingAddressOfOrder':
            return 'Edit shipping address'
        case 'shopifyEditNoteOfOrder':
            return 'Edit note of order'
        case 'bigcommerceCreateOrder':
            return 'Create order'
        case 'bigcommerceDuplicateOrder':
            return 'Duplicate order'
        case 'bigcommerceRefundOrder':
            return 'Refund order'
        case 'rechargeCancelSubscription':
            return 'Cancel subscription'
        case 'rechargeActivateSubscription':
            return 'Activate subscription'
        case 'rechargeSkipCharge':
            return 'Skip charge'
        case 'rechargeUnskipCharge':
            return 'Unskip charge'
        case 'rechargeRefundCharge':
            return 'Refund charge'
        case 'rechargeRefundOrder':
            return 'Refund order'
        case 'customHttpAction':
            return 'Custom HTTP action'
        default:
            return assertNever(actionName)
    }
}

export function getActionExecutedLabel({
    actionLabel,
    actionName,
}: {
    actionLabel: string | null | undefined
    actionName: ActionExecutedActionName
}): string {
    if (typeof actionLabel === 'string' && actionLabel.trim()) {
        return actionLabel
    }

    return getDefaultActionLabel(actionName)
}
