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

type UseAIJourneyResponseRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyResponseRate = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyResponseRateOptions): MetricProps => {
    const enabled = !forceEmpty

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
            undefined,
            undefined,
            enabled,
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
        undefined,
        undefined,
        enabled,
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
        undefined,
        enabled,
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
        undefined,
        enabled,
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
        value: forceEmpty ? 0 : responseRateValue,
        prevValue: forceEmpty ? 0 : responseRatePrevValue,
        series: forceEmpty ? [] : conversionRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: forceEmpty
            ? false
            : isFetchingRepliedMessages ||
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
