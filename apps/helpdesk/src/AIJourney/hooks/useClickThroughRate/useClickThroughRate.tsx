import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
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

type UseClickThroughRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    shopName: string
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useClickThroughRate = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    shopName,
    journeyIds,
    forceEmpty = false,
}: UseClickThroughRateOptions): MetricProps => {
    const enabled = !forceEmpty

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
            undefined,
            undefined,
            enabled,
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
        undefined,
        undefined,
        enabled,
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
        value: forceEmpty ? 0 : clickThroughRateValue,
        prevValue: forceEmpty ? 0 : clickThroughRateValueDataPrevValue,
        series: forceEmpty ? [] : clickThroughRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: forceEmpty
            ? false
            : isFetchingTotalUniqClicks ||
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
