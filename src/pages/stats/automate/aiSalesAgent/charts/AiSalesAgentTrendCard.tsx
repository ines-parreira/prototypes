import { useContext } from 'react'

import {
    AiSalesAgentMetricConfig,
    TrendMetric,
} from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { WarningBannerContext } from 'pages/stats/automate/aiSalesAgent/components/WarningBannerProvider'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

import { useAiSalesAgentTrendCardComponent } from './useAiSalesAgentTrendCardComponent'

const AiSalesAgentTrendCard = ({ chartId, dashboard }: DashboardChartProps) => {
    const config = AiSalesAgentMetricConfig[chartId as TrendMetric]

    const { isBannerVisible } = useContext(WarningBannerContext)

    const TrendCardComponent = useAiSalesAgentTrendCardComponent({
        config,
        chartId,
        dashboard,
        isDataVisible: !isBannerVisible,
    })

    return <TrendCardComponent />
}

export default AiSalesAgentTrendCard
