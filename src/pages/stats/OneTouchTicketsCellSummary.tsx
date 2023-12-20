import React from 'react'
import {
    useClosedTicketsMetric,
    useOneTouchTicketsMetric,
} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const calculatePercentage = (x: number, y: number) => (x / y) * 100

export const OneTouchTicketsCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useOneTouchTicketsMetric(
        cleanStatsFilters,
        userTimezone
    )
    const closedTickets = useClosedTicketsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const metricValue =
        data?.value && closedTickets?.data?.value
            ? calculatePercentage(data.value, closedTickets.data.value)
            : null

    return (
        <>
            {isFetching || closedTickets.isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
