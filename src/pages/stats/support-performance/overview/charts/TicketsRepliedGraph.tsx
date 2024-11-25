import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {
    OverviewChartConfig,
    OverviewMetric,
    PERFORMANCE_OVERVIEW_CHART_TYPE,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketsRepliedGraph = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <OverviewChartCard
            isAnalyticsNewFilters={isAnalyticsNewFilters}
            {...OverviewChartConfig[OverviewMetric.TicketsReplied]}
            chartType={PERFORMANCE_OVERVIEW_CHART_TYPE}
        />
    )
}
