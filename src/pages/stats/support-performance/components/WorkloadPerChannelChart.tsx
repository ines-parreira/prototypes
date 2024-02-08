import React from 'react'
import {useWorkloadPerChannelDistribution} from 'hooks/reporting/distributions'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import GaugeChart from 'pages/stats/GaugeChart'
import {
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
    WORKLOAD_BY_CHANNEL_HINT_MESSAGE,
} from 'services/reporting/constants'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

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
            hint={WORKLOAD_BY_CHANNEL_HINT_MESSAGE}
        >
            {workloadPerChannel.data ? (
                <GaugeChart data={workloadPerChannel.data} />
            ) : (
                <Skeleton />
            )}
        </ChartCard>
    )
}
