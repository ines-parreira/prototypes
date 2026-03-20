import { useMemo } from 'react'

import { useAIJourneyTotalOptOuts } from 'AIJourney/hooks/useAIJourneyTotalOptOuts/useAIJourneyTotalOptOuts'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'
import { aiJourneyTotalNumberOfSalesConversationsQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyOptOutRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    shopName: string
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyOptOutRate = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyOptOutRateOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

    const { trend: optedOutTrend } = useAIJourneyTotalOptOuts({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

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

    const isFetching =
        optedOutTrend.isFetching || isFetchingTotalContactsEnrolled

    const optOutRateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutTrend.data?.value,
            denominator: totalContactsEnrolled?.value,
        })
    }, [optedOutTrend.data, totalContactsEnrolled])

    const optOutRatePrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutTrend.data?.prevValue,
            denominator: totalContactsEnrolled?.prevValue,
        })
    }, [optedOutTrend.data, totalContactsEnrolled])

    return {
        trend: {
            isFetching,
            isError: false,
            data: {
                label: 'Opt-out rate',
                value: isFetching ? null : optOutRateValue,
                prevValue: optOutRatePrevValue ?? null,
            },
        },
        interpretAs: 'less-is-better',
        metricFormat: 'percent',
        hint: {
            title: 'Percentage of recipients who unsubscribed after receiving a message.',
        },
    }
}
