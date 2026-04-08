import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { useGetView } from '@gorgias/helpdesk-queries'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

const validSortOrders = Object.values(ListViewItemsUpdatesOrderBy)
const initialSortOrders: Record<string, ListViewItemsUpdatesOrderBy> = {}

type Options = {
    isDraftView?: boolean
}

export function useSortOrder(
    viewId: number,
    { isDraftView = false }: Options = {},
) {
    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !isDraftView,
        },
    })
    const storageKey = isDraftView ? 'draft' : String(viewId)

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
        () => sortOrders[storageKey] ?? defaultSortOrder,
        [defaultSortOrder, sortOrders, storageKey],
    )

    const setSortOrder = useCallback(
        (order: ListViewItemsUpdatesOrderBy) => {
            setSortOrders({ ...sortOrders, [storageKey]: order })
        },
        [setSortOrders, sortOrders, storageKey],
    )

    return [sortOrder, setSortOrder] as const
}
