import type { OrderLineItem } from '@repo/ecommerce/shopify/types'

import type { OrderRefund, OrderReturn } from '../../../../types'

export type GroupedLineItem = {
    lineItem: OrderLineItem
    quantity: number
}

export type LineItemGroups = {
    active: GroupedLineItem[]
    returnInProgress: GroupedLineItem[]
    returnClosed: GroupedLineItem[]
    removed: GroupedLineItem[]
}

export function groupOrderLineItems(
    lineItems: OrderLineItem[],
    refunds?: OrderRefund[],
    returns?: OrderReturn[],
): LineItemGroups {
    const groups: LineItemGroups = {
        active: [],
        returnInProgress: [],
        returnClosed: [],
        removed: [],
    }

    if (!refunds?.length && !returns?.length) {
        groups.active = lineItems.map((lineItem) => ({
            lineItem,
            quantity: lineItem.quantity,
        }))
        return groups
    }

    const returnInProgressQty = new Map<number, number>()
    const returnClosedQty = new Map<number, number>()

    returns?.forEach((ret) => {
        const isClosed =
            ret.closed_at != null || ret.status?.toLowerCase() === 'closed'
        const target = isClosed ? returnClosedQty : returnInProgressQty

        ret.return_line_items?.forEach((item) => {
            target.set(
                item.line_item_id,
                (target.get(item.line_item_id) ?? 0) + item.quantity,
            )
        })
    })

    const returnViaRefundQty = new Map<number, number>()
    const removedQty = new Map<number, number>()

    refunds?.forEach((refund) => {
        refund.refund_line_items?.forEach((item) => {
            const restockType = item.restock_type?.toLowerCase()
            if (restockType === 'cancel' || restockType === 'no_restock') {
                removedQty.set(
                    item.line_item_id,
                    (removedQty.get(item.line_item_id) ?? 0) + item.quantity,
                )
            } else if (
                restockType === 'return' ||
                restockType === 'legacy_restock'
            ) {
                returnViaRefundQty.set(
                    item.line_item_id,
                    (returnViaRefundQty.get(item.line_item_id) ?? 0) +
                        item.quantity,
                )
            }
        })
    })

    for (const lineItem of lineItems) {
        const id = lineItem.id
        let remaining = lineItem.quantity

        const retInProgress = returnInProgressQty.get(id) ?? 0
        if (retInProgress > 0) {
            const qty = Math.min(retInProgress, remaining)
            groups.returnInProgress.push({ lineItem, quantity: qty })
            remaining -= qty
        }

        const retClosed = returnClosedQty.get(id) ?? 0
        if (retClosed > 0) {
            const qty = Math.min(retClosed, remaining)
            groups.returnClosed.push({ lineItem, quantity: qty })
            remaining -= qty
        }

        const retViaRefund = returnViaRefundQty.get(id) ?? 0
        if (retViaRefund > 0) {
            const alreadyCounted =
                (returnInProgressQty.get(id) ?? 0) +
                (returnClosedQty.get(id) ?? 0)
            const additionalQty = Math.max(0, retViaRefund - alreadyCounted)
            if (additionalQty > 0) {
                const qty = Math.min(additionalQty, remaining)
                groups.returnClosed.push({ lineItem, quantity: qty })
                remaining -= qty
            }
        }

        const removed = removedQty.get(id) ?? 0
        if (removed > 0) {
            const qty = Math.min(removed, remaining)
            groups.removed.push({ lineItem, quantity: qty })
            remaining -= qty
        }

        if (remaining > 0) {
            groups.active.push({ lineItem, quantity: remaining })
        }
    }

    return groups
}
