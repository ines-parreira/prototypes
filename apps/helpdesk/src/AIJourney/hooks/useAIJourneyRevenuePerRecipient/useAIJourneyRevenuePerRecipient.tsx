import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import { calculateRate } from 'AIJourney/utils'
import {
    aiJourneyRevenueQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIJourneyRevenuePerRecipient = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds?: string[],
): MetricProps => {
    const { data: revenueData, isFetching: isFetchingRevenue } = useMetricTrend(
        aiJourneyRevenueQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyRevenueQueryFactory(
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

    const conversionRateValue = useMemo(() => {
        return calculateRate({
            numerator: revenueData?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [revenueData, totalContactsEnrolled])

    const conversionRatePrevValue = useMemo(() => {
        return calculateRate({
            numerator: revenueData?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [revenueData, totalContactsEnrolled])

    return {
        label: 'Revenue per recipient',
        value: conversionRateValue,
        prevValue: conversionRatePrevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        isLoading: isFetchingRevenue || isFetchingTotalContactsEnrolled,
    }
}
