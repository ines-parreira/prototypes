import React from 'react'
import {formatMetricValue} from 'pages/stats/common/utils'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {useTicketsRepliedMetric} from 'hooks/reporting/metrics'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'

export const TicketsRepliedCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {data, isFetching} = useTicketsRepliedMetric(
        pageStatsFilters,
        userTimezone
    )
    const metricValue = data?.value

    return (
        <BodyCellContent>
            {isFetching ? <Skeleton inline /> : formatMetricValue(metricValue)}
        </BodyCellContent>
    )
}
