import React from 'react'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {useMessagesSentMetric} from 'hooks/reporting/metrics'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {formatMetricValue} from './common/utils'

export const MessagesSentCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {data, isFetching} = useMessagesSentMetric(
        pageStatsFilters,
        userTimezone
    )
    const metricValue = data?.value

    return (
        <BodyCellContent>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                metricValue && formatMetricValue(metricValue)
            )}
        </BodyCellContent>
    )
}
