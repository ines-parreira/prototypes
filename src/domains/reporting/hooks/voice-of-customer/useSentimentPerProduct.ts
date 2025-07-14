import { useMemo } from 'react'

import _get from 'lodash/get'

import { QueryReturnType } from 'domains/reporting/hooks/useMetricPerDimension'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { usePostReporting } from 'domains/reporting/models/queries'
import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import { Sentiment, StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export type SentimentData = {
    [PRODUCT_ID_DIMENSION]: string
    sentiment: Sentiment
    value: number
}

export type SentimentMap = Partial<Record<Sentiment, number>>

export type DataPerProductPerSentiment = Record<
    string,
    SentimentMap | undefined
>

export const useSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    sentiment: Sentiment,
    productId?: string,
    sorting?: OrderDirection,
) => {
    const query = sentimentsTicketCountPerProductQueryFactory(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        undefined,
        sorting,
    )

    const { data, isFetching, isError } = usePostReporting<
        QueryReturnType<TicketCubeWithJoins>,
        QueryReturnType<TicketCubeWithJoins>
    >([query], { select: (data) => data.data.data })

    const normalizedData = useMemo(() => {
        if (!data) return {}

        return data.reduce<DataPerProductPerSentiment>((acc, item) => {
            const productId = item[PRODUCT_ID_DIMENSION]
            const sentiment = item[INTENT_DIMENSION]

            if (!productId || !sentiment) return acc

            const ticketCount = item[TICKET_COUNT_MEASURE]

            acc[productId] = acc[productId] || {}
            acc[productId] = {
                ...acc[productId],
                [sentiment]: Number(ticketCount),
            }

            return acc
        }, {})
    }, [data])

    const allData = useMemo(() => {
        if (!data) return []

        return data.reduce<SentimentData[]>((result, item) => {
            if (
                item[INTENT_DIMENSION] === sentiment &&
                item[PRODUCT_ID_DIMENSION]
            ) {
                result.push({
                    [PRODUCT_ID_DIMENSION]: item[PRODUCT_ID_DIMENSION],
                    sentiment,
                    value: Number(item[TICKET_COUNT_MEASURE]),
                })
            }

            return result
        }, [])
    }, [data, sentiment])

    const value: number | null = productId
        ? _get(normalizedData, [productId, sentiment], null)
        : null

    return {
        data: { value, allData },
        isFetching,
        isError,
    }
}

export const usePositiveSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
) =>
    useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Positive,
        productId,
        sorting,
    )

export const useNegativeSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
) =>
    useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Negative,
        productId,
        sorting,
    )

export const useNegativeSentimentsPerProductMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
): MetricTrend => {
    const currentPeriodMetric = useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Negative,
        productId,
        sorting,
    )

    const prevPeriodMetric = useSentimentPerProduct(
        {
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        },
        timezone,
        sentimentCustomFieldId,
        Sentiment.Negative,
        productId,
        sorting,
    )

    return {
        isFetching:
            currentPeriodMetric.isFetching || prevPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError || prevPeriodMetric.isError,
        data: {
            value: currentPeriodMetric.data.value,
            prevValue: prevPeriodMetric.data.value,
        },
    }
}

export const usePositiveSentimentsPerProductMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
): MetricTrend => {
    const currentPeriodMetric = useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Positive,
        productId,
        sorting,
    )

    const prevPeriodMetric = useSentimentPerProduct(
        {
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        },
        timezone,
        sentimentCustomFieldId,
        Sentiment.Positive,
        productId,
        sorting,
    )

    return {
        isFetching:
            currentPeriodMetric.isFetching || prevPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError || prevPeriodMetric.isError,
        data: {
            value: currentPeriodMetric.data.value,
            prevValue: prevPeriodMetric.data.value,
        },
    }
}
