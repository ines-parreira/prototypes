import { useEffect } from 'react'

import type { PayloadAction } from '@reduxjs/toolkit'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { agentAvailability } from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import { DEFAULT_SORTING_DIRECTION } from 'domains/reporting/state/ui/stats/createTableSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { OrderDirection } from 'models/api/types'
import { opposite } from 'models/api/types'

export const useAgentAvailabilitySortingQuery = (
    column: AgentAvailabilityColumn,
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentId?: string,
    ) => MetricWithDecile,
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    },
) => {
    const { pageSet, sortingLoaded, sortingLoading, sortingSet } =
        agentAvailability.actions
    const { getAgentSorting } = agentAvailability.selectors
    const dispatch = useAppDispatch()
    const { cleanStatsFilters, userTimezone } = statsFilters
    useResetPageOnQueryUpdate(pageSet)

    const sorting = useAppSelector(getAgentSorting)
    const { isFetching, data } = useQuery(
        cleanStatsFilters,
        userTimezone,
        sorting?.direction,
    )

    const sortCallback = () => {
        dispatch(
            sortingSet({
                field: column,
                direction:
                    sorting.field === column
                        ? opposite(sorting.direction)
                        : DEFAULT_SORTING_DIRECTION,
            }),
        )
    }

    useEffect(() => {
        if (sorting?.field === column) {
            if (!sorting?.isLoading) {
                isFetching && dispatch(sortingLoading())
            } else {
                !isFetching && dispatch(sortingLoaded(data?.allData || null))
            }
        }
    }, [
        column,
        dispatch,
        data,
        sorting?.field,
        sorting?.isLoading,
        sorting.direction,
        isFetching,
        sortingLoading,
        sortingLoaded,
    ])

    return {
        sortCallback,
        direction: sorting.direction,
        field: sorting.field,
        isOrderedBy: column === sorting.field,
    }
}

const useResetPageOnQueryUpdate = (
    pageSet: (page: number) => PayloadAction<number>,
) => {
    const dispatch = useAppDispatch()
    const { cleanStatsFilters } = useStatsFilters()

    useEffect(() => {
        dispatch(pageSet(1))
    }, [cleanStatsFilters, dispatch, pageSet])
}
