import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentOrderCustomersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { repeatRateQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

export const useGetRepeatRate = (
    filters: StatsFilters,
    timezone: string,
): { data: number; isLoading: boolean } => {
    const { data, isFetching, isError } = useMetricPerDimension(
        repeatRateQueryFactory(filters, timezone),
    )

    const formattedData = useMemo(() => {
        if (!data || data.allData.length === 0 || isFetching || isError) {
            return 0
        }

        const value = safeDivide(
            Number(
                data.allData[0][
                    AiSalesAgentOrderCustomersMeasure.RecurringCount
                ],
            ),
            Number(data.allData[0][AiSalesAgentOrderCustomersMeasure.Count]),
        )

        return +value.toFixed(2)
    }, [data, isFetching, isError])

    return {
        data: formattedData,
        isLoading: isFetching,
    }
}
