import { useEffect } from 'react'

import { PayloadAction } from '@reduxjs/toolkit'
// eslint-disable-next-line no-restricted-imports
import { useDispatch } from 'react-redux'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { opposite, OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import {
    DEFAULT_SORTING_DIRECTION,
    getAgentSorting,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import { AgentsTableColumn } from 'state/ui/stats/types'

export const useAgentsSortingQuery = (
    column: AgentsTableColumn,
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string,
    ) => MetricWithDecile,
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    },
) => {
    const dispatch = useDispatch()
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
    const dispatch = useDispatch()
    const { cleanStatsFilters } = useStatsFilters()

    useEffect(() => {
        dispatch(pageSet(1))
    }, [cleanStatsFilters, dispatch, pageSet])
}
