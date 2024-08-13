import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useState} from 'react'
import IconButton from 'pages/common/components/button/IconButton'
import {FeatureFlagKey} from 'config/featureFlags'
import {useWorkloadPerChannelDistribution} from 'hooks/reporting/distributions'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import GaugeChart from 'pages/stats/GaugeChart'
import {TOTAL_WORKLOAD_BY_CHANNEL_LABEL} from 'services/reporting/constants'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {WORKLOAD_BY_CHANNEL_HINT} from 'pages/stats/SupportPerformanceOverviewConfig'

export const WorkloadPerChannelChart = ({
    isAnalyticsNewFilters = false,
}: {
    isAnalyticsNewFilters?: boolean
}) => {
    const isDeferredLoadingEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsDeferredLoadingExperiment]

    const [enabled, setEnabled] = useState(
        isDeferredLoadingEnabled === undefined
            ? false
            : !isDeferredLoadingEnabled
    )
    useEffect(() => {
        setEnabled(
            isDeferredLoadingEnabled === undefined
                ? false
                : !isDeferredLoadingEnabled
        )
    }, [isDeferredLoadingEnabled])

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const workloadPerChannel = useWorkloadPerChannelDistribution(
        cleanStatsFilters,
        userTimezone,
        enabled
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
