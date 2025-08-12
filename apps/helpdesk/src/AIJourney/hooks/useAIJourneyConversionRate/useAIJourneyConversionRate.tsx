import { useMemo } from 'react'

import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

const calculateConversionRate = ({
    orders,
    uniqContacts,
}: {
    orders: number | undefined | null
    uniqContacts: number | undefined | null
}): number => {
    if (orders && uniqContacts) {
        return (orders / uniqContacts) * 100
    }
    return 0
}

export const useAIJourneyConversionRate = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { data: totalOrdersData, isFetching: isFetchingTotalOrders } =
        useMetricTrend(
            aiJourneyTotalNumberOfOrderQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyId,
            ),
            aiJourneyTotalNumberOfOrderQueryFactory(
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

    const conversionRateValue = useMemo(() => {
        return calculateConversionRate({
            orders: totalOrdersData?.value,
            uniqContacts: totalContactsEnrolled?.value,
        })
    }, [totalOrdersData, totalContactsEnrolled])

    const conversionRateDataPrevValue = useMemo(() => {
        return calculateConversionRate({
            orders: totalOrdersData?.prevValue,
            uniqContacts: totalContactsEnrolled?.prevValue,
        })
    }, [totalOrdersData, totalContactsEnrolled])

    const { data: ordersTimeSeries, isFetching: isFetchingOrdersSeries } =
        useTimeSeries(
            aiJourneyTotalNumberOfOrderTimeSeriesQuery(
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
                AiSalesAgentOrdersMeasure.Count,
                ordersTimeSeries,
            ),
        [ordersTimeSeries],
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
                value: calculateConversionRate({
                    orders: ordersData.value,
                    uniqContacts: conversationsData?.value,
                }),
            }
        })
    }, [ordersTimeSeriesData, conversationsTimeSeriesData])

    return {
        label: 'Conversion rate',
        value: conversionRateValue,
        prevValue: conversionRateDataPrevValue,
        series: conversionRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        isLoading:
            isFetchingtotalContactsEnrolled ||
            isFetchingTotalOrders ||
            isFetchingOrdersSeries ||
            isFetchingConversationsSeries,
    }
}
