import { useMemo } from 'react'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
    aiJourneyUniqClicksQueryFactory,
    aiJourneyUniqClicksTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

export const useClickThroughRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyIds?: string[],
): MetricProps => {
    const { currency } = useCurrency()

    const { data: totalUniqClicks, isFetching: isFetchingTotalUniqClicks } =
        useMetricTrend(
            aiJourneyUniqClicksQueryFactory(
                filters,
                userTimezone,
                integrationId,
                journeyIds,
            ),
            aiJourneyUniqClicksQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                integrationId,
                journeyIds,
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

    const { data: clicksTimeSeriesData, isFetching: isFetchingClicksSeries } =
        useTimeSeries(
            aiJourneyUniqClicksTimeSeriesQuery(
                filters,
                userTimezone,
                granularity,
                integrationId,
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

    const clickThroughRateTimeSeries = useMemo(() => {
        if (
            !clicksTimeSeriesData?.length ||
            !conversationsTimeSeriesData?.length
        ) {
            return []
        }

        return clicksTimeSeriesData[0].map((clicksData, index) => {
            const conversationsData = conversationsTimeSeriesData[0][index]
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
        label: AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate].title,
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
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate]
                .title,
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId,
            journeyIds,
            shopName,
        },
    }
}
