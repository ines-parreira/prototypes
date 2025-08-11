import React, { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { Skeleton } from '@gorgias/axiom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useWorkloadPerChannelDistribution } from 'domains/reporting/hooks/distributions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import GaugeChart from 'domains/reporting/pages/common/components/charts/GaugeChart'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { WORKLOAD_BY_CHANNEL_HINT } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { TOTAL_WORKLOAD_BY_CHANNEL_LABEL } from 'domains/reporting/services/constants'
import IconButton from 'pages/common/components/button/IconButton'

export const WorkloadPerChannelChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const isDeferredLoadingEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsDeferredLoadingExperiment]

    const [enabled, setEnabled] = useState(
        isDeferredLoadingEnabled === undefined
            ? false
            : !isDeferredLoadingEnabled,
    )
    useEffect(() => {
        setEnabled(
            isDeferredLoadingEnabled === undefined
                ? false
                : !isDeferredLoadingEnabled,
        )
    }, [isDeferredLoadingEnabled])

    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const workloadPerChannel = useWorkloadPerChannelDistribution(
        cleanStatsFilters,
        userTimezone,
        enabled,
    )

    useEffect(() => {
        if (workloadPerChannel.data) {
            setEnabled(true)
        }
    }, [workloadPerChannel.data])

    return (
        <ChartCard
            title={TOTAL_WORKLOAD_BY_CHANNEL_LABEL}
            hint={WORKLOAD_BY_CHANNEL_HINT}
            dashboard={dashboard}
            chartId={chartId}
            titleExtra={
                isDeferredLoadingEnabled &&
                !enabled && (
                    <IconButton
                        className="mr-1"
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => setEnabled(true)}
                        title="Reload"
                    >
                        refresh
                    </IconButton>
                )
            }
        >
            {workloadPerChannel.data ? (
                <GaugeChart data={workloadPerChannel.data} />
            ) : (
                <Skeleton />
            )}
        </ChartCard>
    )
}
