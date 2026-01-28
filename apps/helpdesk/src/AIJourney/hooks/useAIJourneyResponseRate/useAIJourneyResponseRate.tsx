import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyRepliedMessagesQueryFactory,
    aiJourneyRepliedMessagesTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIJourneyResponseRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): MetricProps => {
    const { data: repliedMessagesData, isFetching: isFetchingRepliedMessages } =
        useMetricTrend(
            aiJourneyRepliedMessagesQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyIds,
            ),
            aiJourneyRepliedMessagesQueryFactory(
                integrationId,
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                journeyIds,
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
            journeyIds,
        ),
        aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
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
        data: ordersTimeSeriesData,
        isFetching: isFetchingRepliedMessagesSeries,
    } = useTimeSeries(
        aiJourneyRepliedMessagesTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyIds,
        ),
    )

    const {
        data: conversationsTimeSeriesData,
        isFetching: isFetchingConversationsSeries,
    } = useTimeSeries(
        aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyIds,
        ),
    )

    const conversionRateTimeSeries = useMemo(() => {
        if (
            !ordersTimeSeriesData?.length ||
            !conversationsTimeSeriesData?.length
        ) {
            return []
        }

        return ordersTimeSeriesData[0].map((ordersData, index) => {
            const conversationsData = conversationsTimeSeriesData[0][index]
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
        label: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
        value: responseRateValue,
        prevValue: responseRatePrevValue,
        series: conversionRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading:
            isFetchingRepliedMessages ||
            isFetchingtotalContactsEnrolled ||
            isFetchingRepliedMessagesSeries ||
            isFetchingConversationsSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
            metricName: AIJourneyMetric.ResponseRate,
            integrationId,
            journeyIds,
        },
    }
}
