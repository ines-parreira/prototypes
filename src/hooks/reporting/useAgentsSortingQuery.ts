import { useEffect } from 'react'

import { PayloadAction } from '@reduxjs/toolkit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { opposite, OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { DEFAULT_SORTING_DIRECTION } from 'state/ui/stats/createTableSlice'
import {
    AgentsTableColumn,
    TableSlice,
    VoiceAgentsTableColumn,
} from 'state/ui/stats/types'

export const useAgentsSortingQuery = <
    Columns extends AgentsTableColumn | VoiceAgentsTableColumn,
>(
    column: Columns,
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
    slice: TableSlice<Columns>,
) => {
    const { pageSet, sortingLoaded, sortingLoading, sortingSet } = slice.actions
    const { getAgentSorting } = slice.selectors
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
