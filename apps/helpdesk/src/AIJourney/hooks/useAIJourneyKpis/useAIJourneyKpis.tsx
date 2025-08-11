import { useMemo } from 'react'

import moment from 'moment'

import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'

export type filterType = {
    period: {
        start_datetime: string
        end_datetime: string
    }
}

export type MetricProps = {
    label: string
    value: number
    prevValue?: number | null | undefined
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricTrendFormat
    currency?: string
    isLoading: boolean
}

export const useAIJourneyKpis = (
    integrationId: string,
    shopName: string,
    journeyId?: string,
    customStartDate?: string,
    customEndDate?: string,
) => {
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const filters: filterType = useMemo(() => {
        const start_datetime =
            customStartDate ??
            moment().subtract(30, 'days').startOf('day').format()

        const end_datetime = customEndDate ?? moment().endOf('day').format()

        return {
            period: {
                start_datetime,
                end_datetime,
            },
        }
    }, [customStartDate, customEndDate])

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        journeyId,
    )
    const totalOrders = useAIJourneyTotalOrders(
        integrationId,
        userTimezone,
        filters,
        journeyId,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        journeyId,
    )
    const clickThroughRate = useClickThroughRate(
        integrationId,
        userTimezone,
        filters,
        shopName,
        journeyId,
    )

    return [gmvInfluenced, totalOrders, conversionRate, clickThroughRate]
}
