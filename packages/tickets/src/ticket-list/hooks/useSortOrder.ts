import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { useGetView } from '@gorgias/helpdesk-queries'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

const validSortOrders = Object.values(ListViewItemsUpdatesOrderBy)
const initialSortOrders: Record<number, ListViewItemsUpdatesOrderBy> = {}

export function useSortOrder(viewId: number) {
    const { data: viewResponse } = useGetView(viewId)

    const defaultSortOrder = useMemo(() => {
        const view = viewResponse?.data
        const candidate =
            `${view?.order_by ?? ''}:${view?.order_dir ?? ''}` as ListViewItemsUpdatesOrderBy
        return validSortOrders.includes(candidate)
            ? candidate
            : ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc
    }, [viewResponse])

    const [sortOrders, setSortOrders] = useLocalStorage(
        'ticket-list-view-sort-orders',
        initialSortOrders,
    )

    const sortOrder = useMemo(
        () => sortOrders[viewId] ?? defaultSortOrder,
        [defaultSortOrder, sortOrders, viewId],
    )

    const setSortOrder = useCallback(
        (order: ListViewItemsUpdatesOrderBy) => {
            setSortOrders({ ...sortOrders, [viewId]: order })
        },
        [setSortOrders, sortOrders, viewId],
    )

    return [sortOrder, setSortOrder] as const
}
