import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValueLastMonthQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

export const useGetAverageOrderValueLastMonth = ({
    shopIntegrationId,
}: {
    shopIntegrationId: number
}): { data: number; isLoading: boolean } => {
    try {
        const { data, isFetching, isError } = useMetricPerDimension(
            averageOrderValueLastMonthQueryFactory(shopIntegrationId),
        )

        const formattedData = useMemo(() => {
            if (!data || isFetching || isError) {
                return 0
            }

            const value = safeDivide(
                Number(data.allData[0][AiSalesAgentOrdersMeasure.GmvUsd]),
                Number(data.allData[0][AiSalesAgentOrdersMeasure.Count]),
            )

            return value
        }, [data?.allData, isFetching])

        return {
            data: formattedData,
            isLoading: isFetching,
        }
    } catch (error) {
        console.error(error)
        return {
            data: 0,
            isLoading: false,
        }
    }
}
