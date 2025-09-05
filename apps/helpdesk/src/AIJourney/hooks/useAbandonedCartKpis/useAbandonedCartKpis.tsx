import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'

export type MetricProps = {
    label: string
    value: number
    prevValue?: number | null | undefined
    series?: TimeSeriesDataItem[]
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricTrendFormat
    currency?: string
    isLoading: boolean
}

export const useAbandonedCartKpis = ({
    integrationId,
    journeyId,
    shopName,
    filters,
}: {
    integrationId: string
    journeyId?: string
    shopName: string
    filters: FilterType
}) => {
    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyId,
    )

    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyId,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
        journeyId,
    )

    return {
        metrics: [gmvInfluenced, conversionRate, responseRate],
    }
}
