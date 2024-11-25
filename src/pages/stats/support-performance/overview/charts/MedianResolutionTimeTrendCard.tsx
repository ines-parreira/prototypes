import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useLocalStorage from 'hooks/useLocalStorage'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'

import {MetricName} from 'services/reporting/constants'

export const MedianResolutionTimeTrendCard = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

    return (
        <TrendCard
            isAnalyticsNewFilters={isAnalyticsNewFilters}
            {...OverviewMetricConfig[OverviewMetric.MedianResolutionTime]}
            drillDownMetric={OverviewMetric.MedianResolutionTime}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        isAnalyticsNewFilters={isAnalyticsNewFilters}
                        {...OverviewMetricConfig[
                            OverviewMetric.MedianResolutionTime
                        ]}
                        metric={MetricName.MedianResolutionTime}
                    />
                )
            }
        />
    )
}
