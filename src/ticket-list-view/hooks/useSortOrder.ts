import {useMemo, useRef, useState} from 'react'

export const sortOrderOptions = [
    {
        value: 'last_message_datetime:asc',
        label: '↑ Last message',
    },
    {
        value: 'last_message_datetime:desc',
        label: '↓ Last message',
    },
    {
        value: 'last_received_message_datetime:asc',
        label: '↑ Last received message',
    },
    {
        value: 'last_received_message_datetime:desc',
        label: '↓ Last received message',
    },
    {
        value: 'created_datetime:asc',
        label: '↑ Created',
    },
    {
        value: 'created_datetime:desc',
        label: '↓ Created',
    },
] as const

const sortOrderValues = sortOrderOptions.map((o) => o.value)

export type SortOrder = typeof sortOrderValues[number]

export default function useSortOrder(viewSortOrder: string) {
    const defaultSortOrder = useMemo(
        () =>
            sortOrderValues.includes(viewSortOrder as SortOrder)
                ? (viewSortOrder as SortOrder)
                : sortOrderValues[0],
        [viewSortOrder]
    )

    const currentSortOrder = useRef(defaultSortOrder)
    const [order, setOrder] = useState<SortOrder>(defaultSortOrder)

    if (defaultSortOrder !== currentSortOrder.current) {
        currentSortOrder.current = defaultSortOrder
        setOrder(defaultSortOrder)
    }

    return [order, setOrder] as const
}
