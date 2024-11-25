import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const OpenTicketsTrendCard = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <TrendCard
            isAnalyticsNewFilters={isAnalyticsNewFilters}
            {...OverviewMetricConfig[OverviewMetric.OpenTickets]}
            drillDownMetric={OverviewMetric.OpenTickets}
        />
    )
}
