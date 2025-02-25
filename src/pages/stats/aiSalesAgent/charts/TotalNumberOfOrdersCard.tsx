import React from 'react'

import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
} from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'

const TotalNumberOfOrdersCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
            ]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}

export default TotalNumberOfOrdersCard
