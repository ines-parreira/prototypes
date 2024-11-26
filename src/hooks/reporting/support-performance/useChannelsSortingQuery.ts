import {useEffect} from 'react'
import {useDispatch} from 'react-redux'

import {MetricPerChannelQueryHook} from 'hooks/reporting/metricsPerChannel'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {opposite, OrderDirection} from 'models/api/types'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {
    sortingLoaded,
    sortingLoading,
    sortingSet,
    getChannelsSorting,
} from 'state/ui/stats/channelsSlice'

import {ChannelsTableColumns} from 'state/ui/stats/types'
import {notEmpty} from 'utils'

export const useChannelsSortingQuery = (
    column: ChannelsTableColumns,
    useQuery: MetricPerChannelQueryHook
) => {
    const dispatch = useDispatch()
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const sorting = useAppSelector(getChannelsSorting)
    const {isFetching, data} = useQuery(
        cleanStatsFilters,
        userTimezone,
        sorting.direction
    )

    const sortCallback = () => {
        dispatch(
            sortingSet({
                field: column,
                direction:
                    sorting.field === column
                        ? opposite(sorting.direction)
                        : OrderDirection.Desc,
            })
        )
    }

    useEffect(() => {
        if (sorting.field === column) {
            if (!sorting.isLoading) {
                isFetching && dispatch(sortingLoading())
            } else {
                !isFetching &&
                    dispatch(
                        sortingLoaded(
                            (data?.allData ?? [])
                                .map((result) => result[CHANNEL_DIMENSION])
                                .filter(notEmpty)
                        )
                    )
            }
        }
    }, [
        column,
        dispatch,
        data,
        sorting.field,
        sorting.isLoading,
        sorting.direction,
        isFetching,
    ])

    return {
        sortCallback,
        direction: sorting.direction,
        field: sorting.field,
    }
}
