import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfAgentConverationsTrend'
import {
    fetchTotalNumberOfOrders,
    useTotalNumberOfOrders,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'

const useConversionRate = (filters: StatsFilters, timezone: string) => {
    const totalNumberOfAgentConverationsData =
        useTotalNumberOfAgentConverationsTrend(filters, timezone)
    const totalNumberOfOrdersData = useTotalNumberOfOrders(filters, timezone)

    const isFetching =
        totalNumberOfAgentConverationsData.isFetching ||
        totalNumberOfOrdersData.isFetching
    const isError =
        totalNumberOfAgentConverationsData.isError ||
        totalNumberOfOrdersData.isError

    const data = useMemo(() => {
        if (
            !totalNumberOfAgentConverationsData.data ||
            !totalNumberOfOrdersData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        const value = safeDivide(
            totalNumberOfOrdersData.data.value,
            totalNumberOfAgentConverationsData.data.value,
        )

        const prevValue = safeDivide(
            totalNumberOfOrdersData.data.prevValue,
            totalNumberOfAgentConverationsData.data.prevValue,
        )

        return { value, prevValue }
    }, [
        totalNumberOfAgentConverationsData,
        totalNumberOfOrdersData,
        isError,
        isFetching,
    ])

    return {
        data,
        isFetching,
        isError,
    }
}

const fetchConversionRate = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalNumberOfOrders(filters, timezone),
        fetchTotalNumberOfAgentConverationsTrend(filters, timezone),
    ])
        .then(
            ([totalNumberOfOrdersData, totalNumberOfAgentConverationsData]) => {
                return {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: safeDivide(
                            totalNumberOfOrdersData.data?.value,
                            totalNumberOfAgentConverationsData.data?.value,
                        ),
                        prevValue: safeDivide(
                            totalNumberOfOrdersData.data?.prevValue,
                            totalNumberOfAgentConverationsData.data?.prevValue,
                        ),
                    },
                }
            },
        )
        .catch(() => ({ isFetching: false, isError: true, data: undefined }))
}

export { useConversionRate, fetchConversionRate }
