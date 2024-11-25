import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import {TICKETS_CREATED_VS_CLOSED_HINT} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {CREATED_VS_CLOSED_TICKETS_LABEL} from 'services/reporting/constants'

export const TicketsCreatedVsClosedChart = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    const {timeSeries, isLoading} = useCreatedVsClosedTicketsTimeSeries(
        isAnalyticsNewFilters
    )

    return (
        <ChartCard
            title={CREATED_VS_CLOSED_TICKETS_LABEL}
            hint={TICKETS_CREATED_VS_CLOSED_HINT}
        >
            <BarChart
                isLoading={isLoading}
                data={timeSeries}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
            />
        </ChartCard>
    )
}
