import { Order } from '@gorgias/helpdesk-types'

type OrderWithReturns = Order & {
    returns?: {
        return_line_items?: {
            line_item_id: number
            quantity: number
        }[]
    }[]
}

export const calculateReturnsStatus = (order?: OrderWithReturns) => {
    if (!order?.returns?.length) return null

    const orderedItems = order.line_items || []
    const returnedQuantities = new Map<number, number>()

    order.returns.forEach((returnedOrder) => {
        returnedOrder.return_line_items?.forEach((returnItem) => {
            returnedQuantities.set(
                returnItem.line_item_id,
                (returnedQuantities.get(returnItem.line_item_id) || 0) +
                    returnItem.quantity,
            )
        })
    })

    if (returnedQuantities.size === 0) return null

    const allFullyReturned = orderedItems.every((item) => {
        const returnedQuantity = returnedQuantities.get(item.id) || 0
        return returnedQuantity >= item.quantity
    })

    return allFullyReturned ? 'FullReturn' : 'PartialReturn'
}
