import { useMemo } from 'react'

import { AiSalesMetricConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    config: AiSalesMetricConfig
    isDataVisible: boolean
}

const useNullTrend = () => {
    return {
        isFetching: false,
        isError: false,
        data: { value: 0, prevValue: 0 },
    }
}

export const useAiSalesAgentTrendCardComponent = ({
    isDataVisible,
    config,
    chartId,
    dashboard,
}: Props) => {
    return useMemo(() => {
        const useTrend = isDataVisible ? config.useTrend : useNullTrend

        return () => (
            <TrendCard
                {...config}
                useTrend={useTrend}
                dashboard={dashboard}
                chartId={chartId}
            />
        )
    }, [isDataVisible, config, chartId, dashboard])
}
