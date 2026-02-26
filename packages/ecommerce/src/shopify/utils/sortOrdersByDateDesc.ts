type WithCreatedAt = {
    order: Pick<{ created_at: string }, 'created_at'>
}

export function sortOrdersByDateDesc<T extends WithCreatedAt>(
    orders: T[],
): T[] {
    return [...orders].sort((a, b) => {
        const dateA = new Date(a.order.created_at).getTime()
        const dateB = new Date(b.order.created_at).getTime()

        if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0
        if (Number.isNaN(dateA)) return 1
        if (Number.isNaN(dateB)) return -1

        return dateB - dateA
    })
}
