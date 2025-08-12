import { useMemo } from 'react'

import {
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
    aiJourneyUniqClicksQueryFactory,
    aiJourneyUniqClicksTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ConvertTrackingEventsMeasure } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

const calculateClickThroughRate = ({
    clicks,
    uniqContacts,
}: {
    clicks: number | undefined | null
    uniqContacts: number | undefined | null
}): number => {
    if (clicks && uniqContacts) {
        return (clicks / uniqContacts) * 100
    }
    return 0
}

export const useClickThroughRate = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: totalUniqClicks, isFetching: isFetchingTotalUniqClicks } =
        useMetricTrend(
            aiJourneyUniqClicksQueryFactory(
                filters,
                userTimezone,
                shopName,
                journeyId,
            ),
            aiJourneyUniqClicksQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                shopName,
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

    const clickThroughRateValue = useMemo(() => {
        return calculateClickThroughRate({
            clicks: totalUniqClicks?.value,
            uniqContacts: totalContactsEnrolled?.value,
        })
    }, [totalUniqClicks, totalContactsEnrolled])

    const clickThroughRateValueDataPrevValue = useMemo(() => {
        return calculateClickThroughRate({
            clicks: totalUniqClicks?.prevValue,
            uniqContacts: totalContactsEnrolled?.prevValue,
        })
    }, [totalUniqClicks, totalContactsEnrolled])

    const { data: clicksTimeSeries, isFetching: isFetchingClicksSeries } =
        useTimeSeries(
            aiJourneyUniqClicksTimeSeriesQuery(
                filters,
                userTimezone,
                granularity,
                shopName,
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
                ConvertTrackingEventsMeasure.UniqClicks,
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
                value: calculateClickThroughRate({
                    clicks: clicksData.value,
                    uniqContacts: conversationsData?.value,
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
        metricFormat: 'percent',
        currency,
        isLoading:
            isFetchingTotalUniqClicks ||
            isFetchingtotalContactsEnrolled ||
            isFetchingClicksSeries ||
            isFetchingConversationsSeries,
    }
}
