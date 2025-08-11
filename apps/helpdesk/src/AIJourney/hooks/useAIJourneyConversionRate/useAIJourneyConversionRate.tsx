import { useMemo } from 'react'

import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyConversionRate = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
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
        if (totalOrdersData?.value && totalContactsEnrolled?.value) {
            return (totalOrdersData.value / totalContactsEnrolled.value) * 100
        }
        return 0
    }, [totalOrdersData, totalContactsEnrolled])

    const conversionRateDataPrevValue = useMemo(() => {
        if (totalOrdersData?.prevValue && totalContactsEnrolled?.prevValue) {
            return (
                (totalOrdersData.prevValue / totalContactsEnrolled.prevValue) *
                100
            )
        }
        return 0
    }, [totalOrdersData, totalContactsEnrolled])

    return {
        label: 'Conversion rate',
        value: conversionRateValue,
        prevValue: conversionRateDataPrevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        isLoading: isFetchingtotalContactsEnrolled || isFetchingTotalOrders,
    }
}
