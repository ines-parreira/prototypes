import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalSalesOportunityAIConvTrend,
    useTotalSalesOportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOportunityAIConvTrend'

const calculateRate = (currentValue: number, totalValue: number) => {
    return (currentValue / totalValue) * 1.35 || 0
}

const useRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    const gmvInfluencedData = useGmvInfluencedTrend(filters, timezone)
    const totalAIConvData = useTotalSalesOportunityAIConvTrend(
        filters,
        timezone,
    )

    const calculateValues = (data: any, prevData: any) => {
        if (!data || !prevData) {
            return { value: undefined, prevValue: undefined }
        }

        const value = calculateRate(data.value || 0, prevData.value || 0)
        const prevValue = calculateRate(
            data.prevValue || 0,
            prevData.prevValue || 0,
        )

        return { value, prevValue }
    }

    const { value, prevValue } = useMemo(() => {
        return calculateValues(gmvInfluencedData.data, totalAIConvData.data)
    }, [gmvInfluencedData, totalAIConvData])

    const loading = gmvInfluencedData.isFetching || totalAIConvData.isFetching

    return {
        data:
            value !== undefined && prevValue !== undefined
                ? { value, prevValue }
                : undefined,
        isFetching: loading,
        isError: false,
    }
}

const fetchRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalSalesOportunityAIConvTrend(filters, timezone),
        fetchGmvInfluencedTrend(filters, timezone),
    ])
        .then(([totalAIConvData, gmvInfluencedData]) => {
            return {
                isFetching: false,
                isError: false,
                data: {
                    value: calculateRate(
                        gmvInfluencedData.data?.value || 0,
                        totalAIConvData.data?.value || 0,
                    ),
                    prevValue: calculateRate(
                        gmvInfluencedData.data?.prevValue || 0,
                        totalAIConvData.data?.prevValue || 0,
                    ),
                },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useRoiRateTrend, fetchRoiRateTrend }
