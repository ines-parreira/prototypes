import { useContext, useMemo } from 'react'

import {
    AiSalesAgentMetricConfig,
    TrendMetric,
} from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { WarningBannerContext } from 'pages/stats/automate/aiSalesAgent/components/WarningBannerProvider'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

const useNullTrend = () => {
    return {
        isFetching: false,
        isError: false,
        data: { value: 0, prevValue: 0 },
    }
}

const AiSalesAgentTrendCard = ({ chartId, dashboard }: DashboardChartProps) => {
    const config = AiSalesAgentMetricConfig[chartId as TrendMetric]

    const { isBannerVisible } = useContext(WarningBannerContext)

    const TrendCardComponent = useMemo(() => {
        const useTrend = isBannerVisible ? useNullTrend : config.useTrend

        return () => (
            <TrendCard
                {...config}
                useTrend={useTrend}
                dashboard={dashboard}
                chartId={chartId}
            />
        )
    }, [isBannerVisible, config, chartId, dashboard])

    return <TrendCardComponent />
}

export default AiSalesAgentTrendCard
