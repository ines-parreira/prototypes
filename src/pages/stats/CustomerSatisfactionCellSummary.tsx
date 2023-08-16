import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {useCustomerSatisfactionMetric} from 'hooks/reporting/metrics'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'

export const CustomerSatisfactionCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useCustomerSatisfactionMetric(
        cleanStatsFilters,
        userTimezone
    )

    return (
        <>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    data?.value,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
