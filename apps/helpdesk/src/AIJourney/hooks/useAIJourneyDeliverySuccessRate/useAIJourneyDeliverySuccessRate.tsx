import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyFailedMessagesQueryFactory,
    aiJourneyFailedMessagesTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import type { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyDeliverySuccessRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyIds?: string[],
): MetricProps => {
    const { data: failedMessagesData, isFetching: isFetchingFailedMessages } =
        useMetricTrend(
            aiJourneyFailedMessagesQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyIds,
            ),
            aiJourneyFailedMessagesQueryFactory(
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

    const deliverySuccessRateValue = useMemo(() => {
        const total = totalContactsEnrolled?.value
        const failed = failedMessagesData?.value
        if (!total || !failed) {
            return total ? 100 : 0
        }
        return calculateRatiusToPercentage({
            numerator: total - failed,
            denominator: total,
        })
    }, [failedMessagesData, totalContactsEnrolled])

    const deliverySuccessRatePrevValue = useMemo(() => {
        const total = totalContactsEnrolled?.prevValue
        const failed = failedMessagesData?.prevValue
        if (!total || !failed) {
            return total ? 100 : 0
        }
        return calculateRatiusToPercentage({
            numerator: total - failed,
            denominator: total,
        })
    }, [failedMessagesData, totalContactsEnrolled])

    const {
        data: failedMessagesTimeSeriesData,
        isFetching: isFetchingFailedMessagesSeries,
    } = useTimeSeries(
        aiJourneyFailedMessagesTimeSeriesQuery(
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

    const deliverySuccessRateTimeSeries = useMemo(() => {
        if (!failedMessagesTimeSeriesData || !conversationsTimeSeriesData) {
            return []
        }

        return failedMessagesTimeSeriesData[0].map((failedData, index) => {
            const conversationsData = conversationsTimeSeriesData[0][index]
            const total = conversationsData?.value
            const failed = failedData.value
            if (!total || !failed) {
                return {
                    ...failedData,
                    value: total ? 100 : 0,
                }
            }
            return {
                ...failedData,
                value: calculateRatiusToPercentage({
                    numerator: total - failed,
                    denominator: total,
                }),
            }
        })
    }, [failedMessagesTimeSeriesData, conversationsTimeSeriesData])

    return {
        label: 'Delivery Success Rate',
        value: deliverySuccessRateValue,
        prevValue: deliverySuccessRatePrevValue,
        series: deliverySuccessRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading:
            isFetchingFailedMessages ||
            isFetchingtotalContactsEnrolled ||
            isFetchingFailedMessagesSeries ||
            isFetchingConversationsSeries,
    }
}
