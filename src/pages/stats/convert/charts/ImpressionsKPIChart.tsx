import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {METRICS} from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {useCampaignTotalStats} from 'pages/stats/convert/hooks/useCampaignTotalStats'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'

export const ImpressionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {data, isLoading} = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.impressions.title}
            hint={METRICS.impressions.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {data?.impressions}
            </BigNumberMetric>
        </MetricCard>
    )
}
