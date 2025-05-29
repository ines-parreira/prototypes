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

export enum Sentiment {
    Positive = 'Positive',
    Negative = 'Negative',
}

export type SentimentData = {
    productId: string
    sentiment: Sentiment
    value: number
}

export type SentimentMap = Partial<Record<Sentiment, SentimentData>>

export type DataPerProductPerSentiment = Record<
    string,
    SentimentMap | undefined
>

export const useSentimentPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: string,
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
                    productId,
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

    return {
        data: { value, allData: normalizedData },
        isFetching,
        isError,
    }
}

export const useNegativeSentimentsPerProductMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sentimentCustomFieldId: number,
    productId: string,
): MetricTrend => {
    const currentPeriodMetric = useSentimentPerProduct(
        statsFilters,
        timezone,
        String(sentimentCustomFieldId),
        Sentiment.Negative,
        productId,
    )

    const prevPeriodMetric = useSentimentPerProduct(
        {
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        },
        timezone,
        String(sentimentCustomFieldId),
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
        String(sentimentCustomFieldId),
        Sentiment.Positive,
        productId,
    )

    const prevPeriodMetric = useSentimentPerProduct(
        {
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        },
        timezone,
        String(sentimentCustomFieldId),
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
