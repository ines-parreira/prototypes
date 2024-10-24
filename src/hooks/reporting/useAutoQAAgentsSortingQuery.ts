import {PayloadAction} from '@reduxjs/toolkit'
import {useEffect} from 'react'
import {useDispatch} from 'react-redux'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {opposite, OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {AutoQAAgentsTableColumn} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {DEFAULT_SORTING_DIRECTION} from 'state/ui/stats/agentPerformanceSlice'
import {
    getAgentSorting,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/autoQAAgentPerformanceSlice'

export const useAutoQAAgentsSortingQuery = (
    column: AutoQAAgentsTableColumn,
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string
    ) => MetricWithDecile
) => {
    const dispatch = useDispatch()
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    useResetPageOnQueryUpdate(pageSet)

    const sorting = useAppSelector(getAgentSorting)
    const {isFetching, data} = useQuery(
        cleanStatsFilters,
        userTimezone,
        sorting?.direction
    )

    const sortCallback = () => {
        dispatch(
            sortingSet({
                field: column,
                direction:
                    sorting.field === column
                        ? opposite(sorting.direction)
                        : DEFAULT_SORTING_DIRECTION,
            })
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
    pageSet: (page: number) => PayloadAction<number>
) => {
    const dispatch = useDispatch()
    const {cleanStatsFilters} = useNewStatsFilters()

    useEffect(() => {
        dispatch(pageSet(1))
    }, [cleanStatsFilters, dispatch, pageSet])
}
