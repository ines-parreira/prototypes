import {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {opposite, OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {
    DEFAULT_SORTING_DIRECTION,
    getAgentSorting,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TableColumn} from 'state/ui/stats/types'

export const useSortingQuery = (
    column: TableColumn,
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string
    ) => MetricWithDecile
) => {
    const dispatch = useDispatch()
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    useResetPageOnQueryUpdate()

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
    }
}

const useResetPageOnQueryUpdate = () => {
    const dispatch = useDispatch()
    const {cleanStatsFilters} = useAppSelector(getCleanStatsFiltersWithTimezone)

    useEffect(() => {
        dispatch(pageSet(1))
    }, [cleanStatsFilters, dispatch])
}
