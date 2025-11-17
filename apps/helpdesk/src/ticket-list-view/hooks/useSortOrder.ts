import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

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
    {
        value: 'updated_datetime:asc',
        label: '↑ Updated',
        tooltipText: 'Oldest updated tickets appear first',
    },
    {
        value: 'updated_datetime:desc',
        label: '↓ Updated',
        tooltipText: 'Newest updated tickets appear first',
    },
    {
        value: 'priority:asc',
        label: '↑ Priority',
        tooltipText: 'Lowest priority tickets appear first',
    },
    {
        value: 'priority:desc',
        label: '↓ Priority',
        tooltipText: 'Highest priority tickets appear first',
    },
    ,
] as {
    value: ListViewItemsUpdatesOrderBy
    label: string
    tooltipText: string
}[]

const initialSortOrders: Record<number, ListViewItemsUpdatesOrderBy> = {}

export default function useSortOrder(
    viewId: number,
    viewSortOrder: ListViewItemsUpdatesOrderBy,
) {
    const sortOrderValues = sortOrderOptions.map((o) => o.value)

    const defaultSortOrder = useMemo(
        () =>
            sortOrderValues.includes(viewSortOrder)
                ? viewSortOrder
                : sortOrderValues[0],
        [sortOrderValues, viewSortOrder],
    )

    const [sortOrders, setSortOrders] = useLocalStorage(
        'ticket-list-view-sort-orders',
        initialSortOrders,
    )

    const sortOrder = useMemo(
        () => sortOrders[viewId] || defaultSortOrder,
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
