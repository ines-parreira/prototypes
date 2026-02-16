import { useMemo } from 'react'

import type {
    MetricWithDecileData,
    StringWhichShouldBeNumber,
} from 'domains/reporting/hooks/types'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { MetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    gmvInfluencedQueryFactory,
    gmvUSDInfluencedQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import {
    AISalesAgentGMVInfluencedQueryFactoryV2,
    AISalesAgentGMVUsdInfluencedQueryFactoryV2,
} from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const CURRENCY_DIMENSION = AiSalesAgentOrdersDimension.Currency
const GMV_MEASURE = AiSalesAgentOrdersMeasure.Gmv

export const formatGmvInfluencedData = (
    data: MetricWithDecileData<StringWhichShouldBeNumber>,
    previousPeriodData: MetricWithDecileData<StringWhichShouldBeNumber>,
): MetricTrendWithCurrency['data'] => {
    const currentValue = data?.allData?.[0]?.[GMV_MEASURE]
    const prevValue = previousPeriodData?.allData?.[0]?.[GMV_MEASURE]
    const currency = data?.allData?.[0]?.[CURRENCY_DIMENSION]

    return {
        value: currentValue ? parseFloat(currentValue) : null,
        prevValue: prevValue ? parseFloat(prevValue) : null,
        currency: currency || 'USD',
    }
}

const useGmvInfluencedTrend = (
    filters: StatsFilters,
    timezone: string,
): MetricTrendWithCurrency => {
    const currentPeriodQuery = gmvInfluencedQueryFactory(filters, timezone)
    const previousPeriodQuery = gmvInfluencedQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    )

    const { data, isError, isFetching } = useMetricPerDimensionV2(
        currentPeriodQuery,
        AISalesAgentGMVInfluencedQueryFactoryV2({
            filters,
            timezone,
        }),
    )

    const {
        data: previousPeriodData,
        isError: isPreviousPeriodError,
        isFetching: isPreviousPeriodFetching,
    } = useMetricPerDimensionV2(
        previousPeriodQuery,
        AISalesAgentGMVInfluencedQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

    const formattedData = useMemo(
        () => formatGmvInfluencedData(data, previousPeriodData),
        [data, previousPeriodData],
    )

    return {
        isFetching: isFetching || isPreviousPeriodFetching,
        isError: isError || isPreviousPeriodError,
        data: formattedData,
    }
}

const useGmvInfluencedTrendInUSD = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        gmvUSDInfluencedQueryFactory(filters, timezone),
        gmvUSDInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentGMVUsdInfluencedQueryFactoryV2({ filters, timezone }),
        AISalesAgentGMVUsdInfluencedQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

const fetchGmvInfluencedTrend = async (
    filters: StatsFilters,
    timezone: string,
): Promise<MetricTrendWithCurrency> => {
    const currentPeriodQuery = gmvInfluencedQueryFactory(filters, timezone)
    const previousPeriodQuery = gmvInfluencedQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    )

    try {
        const [currentPeriodResult, previousPeriodResult] = await Promise.all([
            fetchMetricPerDimensionV2<StringWhichShouldBeNumber>(
                currentPeriodQuery,
                AISalesAgentGMVInfluencedQueryFactoryV2({
                    filters,
                    timezone,
                }),
            ),
            fetchMetricPerDimensionV2<StringWhichShouldBeNumber>(
                previousPeriodQuery,
                AISalesAgentGMVInfluencedQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
            ),
        ])

        const formattedData = formatGmvInfluencedData(
            currentPeriodResult.data,
            previousPeriodResult.data,
        )

        return {
            isFetching: false,
            isError:
                currentPeriodResult.isError || previousPeriodResult.isError,
            data: formattedData,
        }
    } catch {
        return {
            isFetching: false,
            isError: true,
            data: {
                value: null,
                prevValue: null,
                currency: 'USD',
            },
        }
    }
}

const fetchGmvInfluencedTrendInUSD = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        gmvUSDInfluencedQueryFactory(filters, timezone),
        gmvUSDInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentGMVUsdInfluencedQueryFactoryV2({ filters, timezone }),
        AISalesAgentGMVUsdInfluencedQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export {
    useGmvInfluencedTrend,
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrendInUSD,
    fetchGmvInfluencedTrendInUSD,
}
