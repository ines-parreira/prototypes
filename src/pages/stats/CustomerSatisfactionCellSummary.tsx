import React from 'react'
import {useCustomerSatisfactionMetric} from 'hooks/reporting/metrics'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'

export const CustomerSatisfactionCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const {data, isFetching} = useCustomerSatisfactionMetric(
        pageStatsFilters,
        userTimezone
    )

    return (
        <BodyCellContent>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    data?.value,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCellContent>
    )
}
