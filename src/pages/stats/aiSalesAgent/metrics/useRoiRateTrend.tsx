import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import { infinityNanToZero } from 'pages/stats/aiSalesAgent/metrics/utils'

const calculateRoiRate = (
    gmvInfluenced?: number | null,
    totalConversations?: number | null,
    totalAutomatedSales?: number | null,
): number => {
    const gmv = gmvInfluenced ?? 0
    const conversations = totalConversations ?? 0
    const automatedSales = totalAutomatedSales ?? 0

    const denominator = conversations * 0.2 + automatedSales
    if (denominator === 0) {
        return 0
    }

    return infinityNanToZero(gmv / denominator)
}

const useRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    const gmvInfluencedData = useGmvInfluencedTrend(filters, timezone)
    const totalNumberOfAutomatedSalesData = useTotalNumberOfAutomatedSalesTrend(
        filters,
        timezone,
    )
    const totalAIConvData = useTotalSalesOpportunityAIConvTrend(
        filters,
        timezone,
    )

    const calculateValues = (
        gmvInfluencedData: any,
        totalAIConvData: any,
        totalNumberOfAutomatedSalesData: any,
    ) => {
        if (
            !gmvInfluencedData ||
            !totalAIConvData ||
            !totalNumberOfAutomatedSalesData
        ) {
            return { value: undefined, prevValue: undefined }
        }

        const value = calculateRoiRate(
            gmvInfluencedData.value,
            totalAIConvData.value,
            totalNumberOfAutomatedSalesData.value,
        )
        const prevValue = calculateRoiRate(
            gmvInfluencedData.prevValue,
            totalAIConvData.prevValue,
            totalNumberOfAutomatedSalesData.prevValue,
        )

        return { value, prevValue }
    }

    const { value, prevValue } = useMemo(() => {
        return calculateValues(
            gmvInfluencedData.data,
            totalAIConvData.data,
            totalNumberOfAutomatedSalesData.data,
        )
    }, [gmvInfluencedData, totalAIConvData, totalNumberOfAutomatedSalesData])

    const isFetching =
        gmvInfluencedData.isFetching ||
        totalAIConvData.isFetching ||
        totalNumberOfAutomatedSalesData.isFetching

    const isError =
        gmvInfluencedData.isError ||
        totalAIConvData.isError ||
        totalNumberOfAutomatedSalesData.isError

    return {
        data:
            value !== undefined && prevValue !== undefined
                ? { value, prevValue }
                : undefined,
        isFetching,
        isError,
    }
}

const fetchRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalSalesOpportunityAIConvTrend(filters, timezone),
        fetchGmvInfluencedTrend(filters, timezone),
        fetchTotalNumberOfAutomatedSalesTrend(filters, timezone),
    ])
        .then(
            ([
                totalAIConvData,
                gmvInfluencedData,
                totalNumberOfAutomatedSalesData,
            ]) => {
                return {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: calculateRoiRate(
                            gmvInfluencedData.data?.value,
                            totalAIConvData.data?.value,
                            totalNumberOfAutomatedSalesData.data?.value,
                        ),
                        prevValue: calculateRoiRate(
                            gmvInfluencedData.data?.prevValue,
                            totalAIConvData.data?.prevValue,
                            totalNumberOfAutomatedSalesData.data?.prevValue,
                        ),
                    },
                }
            },
        )
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useRoiRateTrend, fetchRoiRateTrend }
