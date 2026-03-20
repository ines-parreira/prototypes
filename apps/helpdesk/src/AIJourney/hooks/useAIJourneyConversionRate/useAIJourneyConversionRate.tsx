import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyConversionRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyConversionRate = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyConversionRateOptions): MetricProps => {
    const enabled = !forceEmpty

    const { data: totalOrdersData, isFetching: isFetchingTotalOrders } =
        useMetricTrend(
            aiJourneyTotalNumberOfOrderQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyIds,
            ),
            aiJourneyTotalNumberOfOrderQueryFactory(
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

    const conversionRateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: totalOrdersData?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [totalOrdersData, totalContactsEnrolled])

    const conversionRatePrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: totalOrdersData?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [totalOrdersData, totalContactsEnrolled])

    const { data: ordersTimeSeriesData, isFetching: isFetchingOrdersSeries } =
        useTimeSeries(
            aiJourneyTotalNumberOfOrderTimeSeriesQuery(
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
        label: 'Conversion rate',
        value: forceEmpty ? 0 : conversionRateValue,
        prevValue: forceEmpty ? 0 : conversionRatePrevValue,
        series: forceEmpty ? [] : conversionRateTimeSeries,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: forceEmpty
            ? false
            : isFetchingtotalContactsEnrolled ||
              isFetchingTotalOrders ||
              isFetchingOrdersSeries ||
              isFetchingConversationsSeries,
    }
}
