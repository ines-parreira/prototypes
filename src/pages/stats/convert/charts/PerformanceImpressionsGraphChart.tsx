import React from 'react'

import { ReportingGranularity } from 'models/reporting/types'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatTimeSeriesData } from 'pages/stats/common/utils'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { IMPRESSIONS_LABEL } from 'pages/stats/convert/constants/labels'
import { usePerformanceCampaignPerformanceStats } from 'pages/stats/convert/hooks/usePerformanceCampaignPerformanceStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'

export const PerformanceImpressionsGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, campaignPerformanceSeries } =
        usePerformanceCampaignPerformanceStats()
    return (
        <ChartCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                isLoading={isLoading}
                data={formatTimeSeriesData(
                    campaignPerformanceSeries?.impressionsSeries,
                    IMPRESSIONS_LABEL,
                    ReportingGranularity.Day,
                )}
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
