import {useCallback, useMemo} from 'react'

import usePersistedState from 'common/hooks/usePersistedState'

export const sortOrderOptions = [
    {
        value: 'last_message_datetime:asc',
        label: '↑ Last message',
        tooltipText: 'Tickets with the oldest last message appear first',
    },
    {
        value: 'last_message_datetime:desc',
        label: '↓ Last message',
        tooltipText: 'Tickets with the newest last message appear first',
    },
    {
        value: 'last_received_message_datetime:asc',
        label: '↑ Last received message',
        tooltipText:
            'Tickets with the oldest last received message appear first',
    },
    {
        value: 'last_received_message_datetime:desc',
        label: '↓ Last received message',
        tooltipText:
            'Tickets with the newest last received message appear first',
    },
    {
        value: 'created_datetime:asc',
        label: '↑ Created',
        tooltipText: 'Oldest created tickets appear first',
    },
    {
        value: 'created_datetime:desc',
        label: '↓ Created',
        tooltipText: 'Newest created tickets appear first',
    },
] as const

const sortOrderValues = sortOrderOptions.map((o) => o.value)

export type SortOrder = (typeof sortOrderValues)[number]

const initialSortOrders: Record<number, SortOrder> = {}

export default function useSortOrder(viewId: number, viewSortOrder: string) {
    const defaultSortOrder = useMemo(
        () =>
            sortOrderValues.includes(viewSortOrder as SortOrder)
                ? (viewSortOrder as SortOrder)
                : sortOrderValues[0],
        [viewSortOrder]
    )

    const [sortOrders, setSortOrders] = usePersistedState(
        'ticket-list-view-sort-orders',
        initialSortOrders
    )

    const sortOrder = useMemo(
        () => sortOrders[viewId] || defaultSortOrder,
        [defaultSortOrder, sortOrders, viewId]
    )

    const setSortOrder = useCallback(
        (order: SortOrder) => {
            setSortOrders({...sortOrders, [viewId]: order})
        },
        [setSortOrders, sortOrders, viewId]
    )

    return [sortOrder, setSortOrder] as const
}
