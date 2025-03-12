import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { METRICS } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'pages/stats/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import MetricCard from 'pages/stats/MetricCard'

export const EngagementKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { data, isLoading } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.engagement.title}
            hint={METRICS.engagement.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {data?.engagement}
            </BigNumberMetric>
        </MetricCard>
    )
}
