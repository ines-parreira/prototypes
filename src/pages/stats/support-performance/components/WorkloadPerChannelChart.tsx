import React from 'react'
import {useWorkloadPerChannelDistribution} from 'hooks/reporting/distributions'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import GaugeChart from 'pages/stats/GaugeChart'
import {TOTAL_WORKLOAD_BY_CHANNEL_LABEL} from 'services/reporting/constants'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {WORKLOAD_BY_CHANNEL_HINT} from 'pages/stats/SupportPerformanceOverviewConfig'

export const WorkloadPerChannelChart = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const workloadPerChannel = useWorkloadPerChannelDistribution(
        cleanStatsFilters,
        userTimezone
    )

    return (
        <ChartCard
            title={TOTAL_WORKLOAD_BY_CHANNEL_LABEL}
            hint={WORKLOAD_BY_CHANNEL_HINT}
        >
            {workloadPerChannel.data ? (
                <GaugeChart data={workloadPerChannel.data} />
            ) : (
                <Skeleton />
            )}
        </ChartCard>
    )
}
