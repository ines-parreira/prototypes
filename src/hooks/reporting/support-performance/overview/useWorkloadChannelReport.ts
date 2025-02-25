import { useDistributionTrendReportData } from 'hooks/reporting/common/useDistributionTrendReportData'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import { StatsFilters } from 'models/stat/types'
import { WORKLOAD_BY_CHANNEL_LABEL } from 'services/reporting/constants'

export const useWorkloadChannelReport = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    fetchingEnabled = true,
) => {
    const workloadDistributions = {
        fetchCurrentDistribution: fetchWorkloadPerChannelDistribution,
        fetchPreviousDistribution: fetchingEnabled
            ? fetchWorkloadPerChannelDistributionForPreviousPeriod
            : () => Promise.resolve({ data: [] }),
        labelPrefix: WORKLOAD_BY_CHANNEL_LABEL,
        title: 'distributions',
        metricFormat: 'decimal' as const,
    }

    const distributions = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadDistributions,
    )

    return { data: distributions.data, isFetching: distributions.isFetching }
}
