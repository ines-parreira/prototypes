import { useContext } from 'react'

import type { TrendMetric } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AiSalesAgentMetricConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { useAiSalesAgentTrendCardComponent } from 'domains/reporting/pages/automate/aiSalesAgent/charts/useAiSalesAgentTrendCardComponent'
import { WarningBannerContext } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

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
