import { useMemo } from 'react'

import {
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
    aiJourneyUniqClicksQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useClickThroughRate = (
    userTimezone: string,
    filters: filterType,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: totalUniqClicks, isFetching: isFetchingTotalUniqClicks } =
        useMetricTrend(
            aiJourneyUniqClicksQueryFactory(filters, userTimezone),
            aiJourneyUniqClicksQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
            ),
        )

    const {
        data: totalContactsEnrolled,
        isFetching: isFetchingtotalContactsEnrolled,
    } = useMetricTrend(
        aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            filters,
            userTimezone,
        ),
        aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
        ),
    )

    const clickThroughRateValue = useMemo(() => {
        if (totalUniqClicks?.value && totalContactsEnrolled?.value) {
            return (totalUniqClicks.value / totalContactsEnrolled.value) * 100
        }
        return 0
    }, [totalUniqClicks, totalContactsEnrolled])

    const clickThroughRateValueDataPrevValue = useMemo(() => {
        if (totalUniqClicks?.prevValue && totalContactsEnrolled?.prevValue) {
            return (
                (totalUniqClicks.prevValue / totalContactsEnrolled.prevValue) *
                100
            )
        }
        return 0
    }, [totalUniqClicks, totalContactsEnrolled])

    return {
        label: 'Click Through Rate',
        value: clickThroughRateValue,
        prevValue: clickThroughRateValueDataPrevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        currency,
        isLoading: isFetchingTotalUniqClicks || isFetchingtotalContactsEnrolled,
    }
}
