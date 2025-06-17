import { useMemo } from 'react'

import _get from 'lodash/get'

import { QueryReturnType } from 'hooks/reporting/useMetricPerDimension'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import { usePostReporting } from 'models/reporting/queries'
import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'
import { notUndefined } from 'utils/types'

export enum Sentiment {
    Positive = 'Positive',
    Negative = 'Negative',
}

export type SentimentData = {
    [PRODUCT_ID_DIMENSION]: string
    sentiment: Sentiment
    value: number
}

export type SentimentMap = Partial<Record<Sentiment, SentimentData>>

export type DataPerProductPerSentiment = Record<
    string,
    SentimentMap | undefined
>

export const fromNormalizedData = (
    normalizedData: DataPerProductPerSentiment,
    sentiment: Sentiment,
) =>
    Object.values(normalizedData)
        .filter(notUndefined)
        .map((item) => item[sentiment])
        .filter(notUndefined)

export const useSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    sentiment: Sentiment,
    productId?: string,
) => {
    const query = sentimentsTicketCountPerProductQueryFactory(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
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
                [sentiment]: {
                    [PRODUCT_ID_DIMENSION]: productId,
                    sentiment,
                    value: Number(ticketCount),
                },
            }

            return acc
        }, {})
    }, [data])

    const value: number | null = productId
        ? _get(normalizedData, [productId, sentiment, 'value'], null)
        : null

    const allData = fromNormalizedData(normalizedData, sentiment)

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
) =>
    useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Positive,
        productId,
    )

export const useNegativeSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId?: string,
) =>
    useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Negative,
        productId,
    )

export const useNegativeSentimentsPerProductMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId: string,
): MetricTrend => {
    const currentPeriodMetric = useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Negative,
        productId,
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
    productId: string,
): MetricTrend => {
    const currentPeriodMetric = useSentimentPerProduct(
        statsFilters,
        timezone,
        sentimentCustomFieldId,
        Sentiment.Positive,
        productId,
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
