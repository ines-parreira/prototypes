import { useMemo } from 'react'

import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyOptedOutQueryFactory,
    aiJourneyOptedOutTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyOptOutRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyId?: string,
): MetricProps => {
    const { data: optedOutData, isFetching: isFetchingOptedOutData } =
        useMetricTrend(
            aiJourneyOptedOutQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyId,
            ),
            aiJourneyOptedOutQueryFactory(
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

    const {
        data: optedOutTimeSeriesData,
        isFetching: isFetchingOptedOutSeries,
    } = useTimeSeries(
        aiJourneyOptedOutTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
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
            journeyId,
        ),
    )

    const optOutRateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutData?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [optedOutData, totalContactsEnrolled])

    const optOutRatePrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutData?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [optedOutData, totalContactsEnrolled])

    const optOutRateTimeSeries = useMemo(() => {
        if (
            !optedOutTimeSeriesData?.length ||
            !conversationsTimeSeriesData?.length
        ) {
            return []
        }

        return optedOutTimeSeriesData[0].map((optedOutData, index) => {
            const conversationsData = conversationsTimeSeriesData[0][index]
            return {
                ...optedOutData,
                value: calculateRatiusToPercentage({
                    numerator: optedOutData.value,
                    denominator: conversationsData?.value,
                }),
            }
        })
    }, [optedOutTimeSeriesData, conversationsTimeSeriesData])

    return {
        label: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
        value: optOutRateValue,
        prevValue: optOutRatePrevValue,
        series: optOutRateTimeSeries,
        interpretAs: 'less-is-better',
        metricFormat: 'percent-precision-1',
        isLoading:
            isFetchingOptedOutData ||
            isFetchingTotalContactsEnrolled ||
            isFetchingOptedOutSeries ||
            isFetchingConversationsSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
            metricName: AIJourneyMetric.OptOutRate,
            integrationId,
            journeyId,
            shopName,
        },
    }
}
