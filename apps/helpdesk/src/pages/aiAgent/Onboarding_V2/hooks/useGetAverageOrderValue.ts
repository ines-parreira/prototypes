import { useMemo } from 'react'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValuePreviewQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

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
