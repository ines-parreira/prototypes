import React from 'react'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'

export const PercentageOfClosedTicketsCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {isFetching} = useClosedTicketsMetric(pageStatsFilters, userTimezone)

    return (
        <BodyCellContent>
            {isFetching ? <Skeleton inline /> : `100%`}
        </BodyCellContent>
    )
}
