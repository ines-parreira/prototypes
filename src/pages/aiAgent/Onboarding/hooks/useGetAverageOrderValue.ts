import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValuePreviewQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

const fakeAverageOrderValue = 150

export const useGetAverageOrderValue = (
    filters: StatsFilters,
    timezone: string,
): { data: number; isLoading: boolean } => {
    const { data, isFetching, isError } = useMetricPerDimension(
        averageOrderValuePreviewQueryFactory(filters, timezone),
    )

    const formattedData = useMemo(() => {
        if (isFetching) {
            return 0
        }

        if (!data || data.allData.length === 0 || isError) {
            return fakeAverageOrderValue
        }

        const value = safeDivide(
            Number(data.allData[0][AiSalesAgentOrdersMeasure.GmvUsd]),
            Number(data.allData[0][AiSalesAgentOrdersMeasure.Count]),
        )

        if (value === 0 || isNaN(value)) {
            return fakeAverageOrderValue
        }

        return value
    }, [data, isFetching, isError])

    return {
        data: formattedData,
        isLoading: isFetching,
    }
}
