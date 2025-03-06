import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'

import {
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from './useTotalNumberOfAgentConverationsTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from './useTotalNumberOfAutomatedSalesTrend'

const useSuccessRateTrend = (filters: StatsFilters, timezone: string) => {
    const totalNumberOfAgentConverationsData =
        useTotalNumberOfAgentConverationsTrend(filters, timezone)
    const totlanumberOfAutomatedSalesData = useTotalNumberOfAutomatedSalesTrend(
        filters,
        timezone,
    )

    const isFetching =
        totalNumberOfAgentConverationsData.isFetching ||
        totlanumberOfAutomatedSalesData.isFetching
    const isError =
        totalNumberOfAgentConverationsData.isError ||
        totlanumberOfAutomatedSalesData.isError

    const data = useMemo(() => {
        if (
            !totalNumberOfAgentConverationsData.data ||
            !totlanumberOfAutomatedSalesData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        const value = safeDivide(
            totlanumberOfAutomatedSalesData.data.value,
            totalNumberOfAgentConverationsData.data.value,
        )

        const prevValue = safeDivide(
            totlanumberOfAutomatedSalesData.data.prevValue,
            totalNumberOfAgentConverationsData.data.prevValue,
        )

        return { value, prevValue }
    }, [
        totalNumberOfAgentConverationsData,
        totlanumberOfAutomatedSalesData,
        isError,
        isFetching,
    ])

    return {
        data,
        isFetching,
        isError,
    }
}

const fetchSuccessRateTrend = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalNumberOfAutomatedSalesTrend(filters, timezone),
        fetchTotalNumberOfAgentConverationsTrend(filters, timezone),
    ])
        .then(
            ([
                totlanumberOfAutomatedSalesData,
                totalNumberOfAgentConverationsData,
            ]) => {
                return {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: safeDivide(
                            totlanumberOfAutomatedSalesData.data?.value,
                            totalNumberOfAgentConverationsData.data?.value,
                        ),
                        prevValue: safeDivide(
                            totlanumberOfAutomatedSalesData.data?.prevValue,
                            totalNumberOfAgentConverationsData.data?.prevValue,
                        ),
                    },
                }
            },
        )
        .catch(() => ({ isFetching: false, isError: true, data: undefined }))
}

export { useSuccessRateTrend, fetchSuccessRateTrend }
