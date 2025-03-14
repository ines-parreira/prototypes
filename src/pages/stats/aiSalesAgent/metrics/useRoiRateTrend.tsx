import { useMemo } from 'react'

import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import { infinityNanToZero } from 'pages/stats/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'utils/reporting'

const calculateRate = (currentValue: number, totalValue: number) => {
    return infinityNanToZero(currentValue / totalValue) * 1.35 || 0
}

const useRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    const gmvInfluencedData = useMetricTrend(
        gmvInfluencedQueryFactory(filters, timezone),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
    const totalAIConvData = useTotalSalesOpportunityAIConvTrend(
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
        fetchTotalSalesOpportunityAIConvTrend(filters, timezone),
        fetchMetricTrend(
            gmvInfluencedQueryFactory(filters, timezone),
            gmvInfluencedQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
        ),
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
