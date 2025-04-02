import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValuePreviewQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

export const useGetAverageOrderValue = (
    filters: StatsFilters,
    timezone: string,
): { data: number; isLoading: boolean } => {
    const { data, isFetching, isError } = useMetricPerDimension(
        averageOrderValuePreviewQueryFactory(filters, timezone),
    )

    const formattedData = useMemo(() => {
        if (!data || data.allData.length === 0 || isFetching || isError) {
            return 0
        }

        const value = safeDivide(
            Number(data.allData[0][AiSalesAgentOrdersMeasure.GmvUsd]),
            Number(data.allData[0][AiSalesAgentOrdersMeasure.Count]),
        )

        return value
    }, [data, isFetching, isError])

    return {
        data: formattedData,
        isLoading: isFetching,
    }
}
