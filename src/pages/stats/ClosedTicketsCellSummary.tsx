import React from 'react'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'

export const ClosedTicketsCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {data, isFetching} = useClosedTicketsMetric(
        pageStatsFilters,
        userTimezone
    )
    const metricValue = data?.value

    return (
        <BodyCellContent>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCellContent>
    )
}
