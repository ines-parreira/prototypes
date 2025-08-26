import { useMemo } from 'react'

import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
    aiJourneyUniqClicksQueryFactory,
    aiJourneyUniqClicksTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { FilterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useClickThroughRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: totalUniqClicks, isFetching: isFetchingTotalUniqClicks } =
        useMetricTrend(
            aiJourneyUniqClicksQueryFactory(
                filters,
                userTimezone,
                integrationId,
                journeyId,
            ),
            aiJourneyUniqClicksQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                integrationId,
                journeyId,
            ),
        )

    const {
        data: totalContactsEnrolled,
        isFetching: isFetchingTotalContactsEnrolled,
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

    const clickThroughRateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: totalUniqClicks?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [totalUniqClicks, totalContactsEnrolled])

    const clickThroughRateValueDataPrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: totalUniqClicks?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [totalUniqClicks, totalContactsEnrolled])

    const { data: clicksTimeSeries, isFetching: isFetchingClicksSeries } =
        useTimeSeries(
            aiJourneyUniqClicksTimeSeriesQuery(
                filters,
                userTimezone,
                granularity,
                integrationId,
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

    const clicksTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentConversationsMeasure.Count,
                clicksTimeSeries,
            ),
        [clicksTimeSeries],
    )

    const conversationsTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentConversationsMeasure.Count,
                conversationsTimeSeries,
            ),
        [conversationsTimeSeries],
    )

    const clickThroughRateTimeSeries = useMemo(() => {
        if (!clicksTimeSeriesData || !conversationsTimeSeriesData) {
            return []
        }

        return clicksTimeSeriesData.map((clicksData, index) => {
            const conversationsData = conversationsTimeSeriesData[index]
            return {
                dateTime: clicksData.dateTime,
                value: calculateRatiusToPercentage({
                    numerator: clicksData.value,
                    denominator: conversationsData?.value,
                }),
            }
        })
    }, [clicksTimeSeriesData, conversationsTimeSeriesData])

    return {
        label: 'Click Through Rate',
        value: clickThroughRateValue,
        prevValue: clickThroughRateValueDataPrevValue,
        series: clickThroughRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        currency,
        isLoading:
            isFetchingTotalUniqClicks ||
            isFetchingTotalContactsEnrolled ||
            isFetchingClicksSeries ||
            isFetchingConversationsSeries,
    }
}
