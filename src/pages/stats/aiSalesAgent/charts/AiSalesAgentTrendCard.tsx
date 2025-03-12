import React from 'react'

import {
    AiSalesAgentMetricConfig,
    TrendMetric,
} from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

const AiSalesAgentTrendCard = ({ chartId, dashboard }: DashboardChartProps) => {
    const config = AiSalesAgentMetricConfig[chartId as TrendMetric]

    return <TrendCard {...config} dashboard={dashboard} chartId={chartId} />
}

export default AiSalesAgentTrendCard
