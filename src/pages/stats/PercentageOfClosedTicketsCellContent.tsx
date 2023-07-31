import React from 'react'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_TEXT} from 'pages/stats/common/utils'

export const PercentageOfClosedTicketsCellContent = ({
    agentId,
}: {
    agentId: number
}) => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        pageStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )

    const {data, isFetching} = useClosedTicketsMetric(
        pageStatsFilters,
        userTimezone
    )

    let metricValue

    if (closedTicketsPerAgent.data?.value && data?.value) {
        metricValue = (closedTicketsPerAgent.data?.value / data?.value) * 100
    }

    const percentageMetricValue =
        formatMetricValue(metricValue) !== NOT_AVAILABLE_TEXT
            ? `${formatMetricValue(metricValue)}%`
            : formatMetricValue(metricValue)

    return (
        <BodyCellContent>
            {isFetching || closedTicketsPerAgent.isFetching ? (
                <Skeleton inline />
            ) : (
                percentageMetricValue
            )}
        </BodyCellContent>
    )
}
