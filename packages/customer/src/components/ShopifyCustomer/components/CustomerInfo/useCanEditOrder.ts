export function useCanEditOrder(order: {
    cancelled_at?: string | null
    created_at?: string
}): boolean {
    if (order.cancelled_at) return false
    if (!order.created_at) return false

    const ageMs = Date.now() - new Date(order.created_at).getTime()
    return Math.round(ageMs / (1000 * 3600 * 24)) < 60
}
