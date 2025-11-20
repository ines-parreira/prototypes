import { useEffect } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAIJourneyRevenuePerRecipient } from '../useAIJourneyRevenuePerRecipient/useAIJourneyRevenuePerRecipient'

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
    filters: FilterType
    journeyIds?: string[]
}

export const useCampaignsKpis = ({
    integrationId,
    filters,
    journeyIds,
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
        journeyIds,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds,
    )
    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds,
    )
    const revenuePerRecipient = useAIJourneyRevenuePerRecipient(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    return {
        metrics: [
            gmvInfluenced,
            revenuePerRecipient,
            conversionRate,
            responseRate,
        ],
    }
}
