import React from 'react'
import {useFirstResponseTimeMetric} from 'hooks/reporting/metrics'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {formatDuration} from './common/utils'

export const FirstResponseTimeCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {data, isFetching} = useFirstResponseTimeMetric(
        pageStatsFilters,
        userTimezone
    )

    const metricValue = data?.value

    return (
        <BodyCellContent>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                metricValue && formatDuration(metricValue, 2)
            )}
        </BodyCellContent>
    )
}
