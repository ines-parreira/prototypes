import { useMemo } from 'react'

import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyRepliedMessagesQueryFactory,
    aiJourneyRepliedMessagesTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { FilterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyResponseRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: repliedMessagesData, isFetching: isFetchingRepliedMessages } =
        useMetricTrend(
            aiJourneyRepliedMessagesQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyId,
            ),
            aiJourneyRepliedMessagesQueryFactory(
                integrationId,
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                journeyId,
            ),
        )

    const {
        data: totalContactsEnrolled,
        isFetching: isFetchingtotalContactsEnrolled,
    } = useMetricTrend(
        aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyId,
        ),
    )

    const responseRateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: repliedMessagesData?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [repliedMessagesData, totalContactsEnrolled])

    const responseRatePrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: repliedMessagesData?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [repliedMessagesData, totalContactsEnrolled])

    const {
        data: repliedMessagesTimeSeries,
        isFetching: isFetchingRepliedMessagesSeries,
    } = useTimeSeries(
        aiJourneyRepliedMessagesTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )

    const {
        data: conversationsTimeSeries,
        isFetching: isFetchingConversationsSeries,
    } = useTimeSeries(
        aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )

    const ordersTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentConversationsMeasure.Count,
                repliedMessagesTimeSeries,
            ),
        [repliedMessagesTimeSeries],
    )

    const conversationsTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentConversationsMeasure.Count,
                conversationsTimeSeries,
            ),
        [conversationsTimeSeries],
    )

    const conversionRateTimeSeries = useMemo(() => {
        if (!ordersTimeSeriesData || !conversationsTimeSeriesData) {
            return []
        }

        return ordersTimeSeriesData.map((ordersData, index) => {
            const conversationsData = conversationsTimeSeriesData[index]
            return {
                ...ordersData,
                value: calculateRatiusToPercentage({
                    numerator: ordersData.value,
                    denominator: conversationsData?.value,
                }),
            }
        })
    }, [ordersTimeSeriesData, conversationsTimeSeriesData])

    return {
        label: 'Response Rate',
        value: responseRateValue,
        prevValue: responseRatePrevValue,
        series: conversionRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        currency,
        isLoading:
            isFetchingRepliedMessages ||
            isFetchingtotalContactsEnrolled ||
            isFetchingRepliedMessagesSeries ||
            isFetchingConversationsSeries,
    }
}
