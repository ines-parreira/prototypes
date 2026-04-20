import type { OrderEcommerceData } from '../../../types'

function getTime(order: OrderEcommerceData): number {
    const time = new Date(order.data.created_at).getTime()
    return Number.isNaN(time) ? 0 : time
}

export function sortOrdersByDateDesc(
    orders: OrderEcommerceData[],
): OrderEcommerceData[] {
    return [...orders].sort((a, b) => getTime(b) - getTime(a))
}
