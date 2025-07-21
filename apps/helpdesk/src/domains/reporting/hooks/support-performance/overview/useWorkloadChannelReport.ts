import { useMemo } from 'react'

import { useDistributionTrendReportData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'domains/reporting/hooks/distributions'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { WORKLOAD_BY_CHANNEL_LABEL } from 'domains/reporting/services/constants'

export const useWorkloadChannelReport = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    fetchingEnabled = true,
) => {
    const workloadDistributions = useMemo(
        () => ({
            fetchCurrentDistribution: fetchWorkloadPerChannelDistribution,
            fetchPreviousDistribution: fetchingEnabled
                ? fetchWorkloadPerChannelDistributionForPreviousPeriod
                : () => Promise.resolve({ data: [] }),
            labelPrefix: WORKLOAD_BY_CHANNEL_LABEL,
            title: 'distributions',
            metricFormat: 'decimal' as const,
        }),
        [fetchingEnabled],
    )

    const distributions = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadDistributions,
    )

    return { data: distributions.data, isFetching: distributions.isFetching }
}
