import { useMemo } from 'react'

import _get from 'lodash/get'

import { QueryReturnType } from 'hooks/reporting/useMetricPerDimension'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { usePostReporting } from 'models/reporting/queries'
import { sentimentsTicketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { StatsFilters } from 'models/stat/types'

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

export const PRODUCT_ID_DIMENSION = TicketProductsEnrichedDimension.ProductId
export const INTENT_DIMENSION =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const TICKET_COUNT_MEASURE = TicketProductsEnrichedMeasure.TicketCount

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

    const { data, isLoading, isError } = usePostReporting<
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
        isLoading,
        isError,
    }
}
