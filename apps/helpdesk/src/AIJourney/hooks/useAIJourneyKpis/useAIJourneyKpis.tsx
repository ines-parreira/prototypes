import { useEffect } from 'react'

import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyOptOutRate } from '../useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'

export type MetricProps = {
    label: string
    value: number
    prevValue?: number | null | undefined
    series?: TimeSeriesDataItem[]
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricValueFormat
    currency?: string
    isLoading: boolean
    drilldown?: DrillDownMetric
}

export type UseAIJourneyKpisParams = {
    integrationId: string
    shopName: string
    filters: FilterType
}

export const useAIJourneyKpis = ({
    integrationId,
    shopName,
    filters,
}: UseAIJourneyKpisParams) => {
    const dispatch = useAppDispatch()

    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    useEffect(() => {
        dispatch(
            mergeStatsFilters({
                period: {
                    start_datetime: filters.period.start_datetime,
                    end_datetime: filters.period.end_datetime,
                },
            }),
        )
    }, [filters.period, dispatch])

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const totalOrders = useAIJourneyTotalOrders(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const clickThroughRate = useClickThroughRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )

    const optOutRate = useAIJourneyOptOutRate(
        integrationId,
        userTimezone,
        filters,
        shopName,
    )

    return {
        metrics: [
            gmvInfluenced,
            totalOrders,
            conversionRate,
            clickThroughRate,
            responseRate,
            optOutRate,
        ],
    }
}
