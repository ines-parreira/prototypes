import { useEffect } from 'react'

import type { MetricPerChannelQueryHook } from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    getChannelsSorting,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'domains/reporting/state/ui/stats/channelsSlice'
import type { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { opposite, OrderDirection } from 'models/api/types'
import { notEmpty } from 'utils'

export const useChannelsSortingQuery = (
    column: ChannelsTableColumns,
    useQuery: MetricPerChannelQueryHook,
) => {
    const dispatch = useAppDispatch()
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const sorting = useAppSelector(getChannelsSorting)
    const { isFetching, data } = useQuery(
        cleanStatsFilters,
        userTimezone,
        sorting.direction,
    )

    const sortCallback = () => {
        dispatch(
            sortingSet({
                field: column,
                direction:
                    sorting.field === column
                        ? opposite(sorting.direction)
                        : OrderDirection.Desc,
            }),
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
                                .filter(notEmpty),
                        ),
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
