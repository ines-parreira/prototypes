import { useMemo, useState } from 'react'

import { FeatureFlagKey } from '../../../config/featureFlags'
import { useFlag } from '../../../core/flags'
import { SORT_OPTIONS, SORT_OPTIONS_WITH_ORDERS } from '../../constants'
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
    type: Record<InteractionFilterType, boolean>
    status: Record<FilterKey, boolean>
    sortOption: SortOption
}

type UseTimelineFilters = {
    items: TimelineItem[]
}

export const useTimelineFilters = ({ items }: UseTimelineFilters) => {
    const enableOrdersInTimeline = useFlag(
        FeatureFlagKey.ShopifyCustomerTimeline,
        false,
    )

    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        type: {
            ticket: true,
            order: true,
        },
        status: {
            open: true,
            closed: true,
            snooze: true,
        },
        sortOption: {
            order: 'desc',
            key: 'last_message_datetime',
            label: 'Last message',
        },
    })

    const { rangeFilter, rangeFilteredTickets, setRangeFilter } =
        useRangeFilter(items)

    const selectedStatusKeys: FilterKey[] = Object.keys(
        activeFilters.status,
    ).filter((key) => activeFilters.status[key as FilterKey]) as FilterKey[]

    const selectedTypeKeys: InteractionFilterType[] = Object.keys(
        activeFilters.type,
    ).filter(
        (key) => activeFilters.type[key as InteractionFilterType],
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

    const sortOptions = enableOrdersInTimeline
        ? SORT_OPTIONS_WITH_ORDERS
        : SORT_OPTIONS

    return {
        activeFilters,
        setActiveFilters,
        selectedStatusKeys,
        selectedTypeKeys,
        rangeFilter,
        setRangeFilter,
        setSortOption,
        sortedTickets,
        sortOptions,
        sortOption,
    }
}
