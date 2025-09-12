import { useMemo } from 'react'

import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import {
    aiJourneyOptedOutQueryFactory,
    aiJourneyTotalNumberOfSalesConversationsQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyOptOutRate = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
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

    return {
        label: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
        value: optOutRateValue,
        prevValue: optOutRatePrevValue,
        interpretAs: 'less-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: isFetchingOptedOutData || isFetchingTotalContactsEnrolled,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
            metricName: AIJourneyMetric.OptOutRate,
            integrationId,
            journeyId,
            shopName,
        },
    }
}
