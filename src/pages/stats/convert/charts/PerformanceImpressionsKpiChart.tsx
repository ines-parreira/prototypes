import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'

export const PerformanceImpressionsKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, totalStatsData } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {totalStatsData?.impressions}
            </BigNumberMetric>
        </MetricCard>
    )
}
