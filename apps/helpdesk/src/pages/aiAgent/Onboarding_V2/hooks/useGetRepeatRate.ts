import { useMemo } from 'react'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentOrderCustomersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { repeatRateQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

const fakeRepeatRate = 22

export const useGetRepeatRate = (
    filters: StatsFilters,
    timezone: string,
): { data: number; isLoading: boolean } => {
    const { data, isFetching, isError } = useMetricPerDimension(
        repeatRateQueryFactory(filters, timezone),
    )

    const formattedData = useMemo(() => {
        if (isFetching) {
            return 0
        }

        // if Error or no data, return fakeRepeatRate
        if (!data || data.allData.length === 0 || isError) {
            return fakeRepeatRate
        }

        const value =
            safeDivide(
                Number(
                    data.allData[0][
                        AiSalesAgentOrderCustomersMeasure.RecurringCount
                    ],
                ),
                Number(
                    data.allData[0][AiSalesAgentOrderCustomersMeasure.Count],
                ),
            ) * 100

        // if value is 0 or NaN, return fakeRepeatRate
        if (value === 0 || isNaN(value)) {
            return fakeRepeatRate
        }

        return +value.toFixed(2)
    }, [data, isFetching, isError])

    return {
        data: formattedData,
        isLoading: isFetching,
    }
}
