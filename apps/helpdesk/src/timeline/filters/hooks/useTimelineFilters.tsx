import { useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { SORT_OPTIONS_WITH_ORDERS } from '../../constants'
import {
    FilterKey,
    InteractionFilterType,
    SortOption,
    TimelineItem,
} from '../../types'
import { filterTicketsByType } from '../helpers/interactionFilter'
import { filterTicketsByStatus } from '../helpers/statusFilter'
import { useRangeFilter } from './useRangeFilter'
import { useSort } from './useSort'

export type ActiveFilters = {
    status: Record<FilterKey, boolean>
    sortOption: SortOption
}

type UseTimelineFilters = {
    items: TimelineItem[]
}

const INTERACTION_TYPE_FILTER_KEY = 'ct::interaction-type-filter'

export const useTimelineFilters = ({ items }: UseTimelineFilters) => {
    const [memoizedFilters, setMemoizedFilters] = useLocalStorage<
        Record<InteractionFilterType, boolean>
    >(INTERACTION_TYPE_FILTER_KEY, { ticket: true, order: true })

    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        status: {
            open: true,
            closed: true,
            snooze: true,
        },
        sortOption: {
            order: 'desc',
            key: 'last_message_datetime',
            label: 'Last updated',
        },
    })

    const { rangeFilter, rangeFilteredTickets, setRangeFilter } =
        useRangeFilter(items)

    const selectedStatusKeys: FilterKey[] = Object.keys(
        activeFilters.status,
    ).filter((key) => activeFilters.status[key as FilterKey]) as FilterKey[]

    const selectedTypeKeys: InteractionFilterType[] = Object.keys(
        memoizedFilters,
    ).filter(
        (key) => memoizedFilters[key as InteractionFilterType],
    ) as InteractionFilterType[]

    const mappedTickets = useMemo(() => {
        let filteredTickets = [...rangeFilteredTickets]

        if (selectedStatusKeys.length > 0) {
            filteredTickets = filterTicketsByStatus(
                rangeFilteredTickets,
                selectedStatusKeys,
            )
        }

        if (selectedTypeKeys.length > 0) {
            filteredTickets = filterTicketsByType(
                filteredTickets,
                selectedTypeKeys,
            )
        }

        return filteredTickets
    }, [rangeFilteredTickets, selectedStatusKeys, selectedTypeKeys])

    const { setSortOption, sortedTickets, sortOption } = useSort(mappedTickets)

    return {
        activeFilters,
        memoizedFilters,
        setActiveFilters,
        setMemoizedFilters,
        selectedStatusKeys,
        selectedTypeKeys,
        rangeFilter,
        setRangeFilter,
        setSortOption,
        sortedTickets,
        sortOptions: SORT_OPTIONS_WITH_ORDERS,
        sortOption,
    }
}
