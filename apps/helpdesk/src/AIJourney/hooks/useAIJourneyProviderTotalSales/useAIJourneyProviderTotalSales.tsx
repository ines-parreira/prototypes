import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyProviderRevenueQueryFactory,
    aiJourneyProviderRevenueTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import type { AttributionModelComparison } from 'AIJourney/utils/attributionModelComparison'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyProviderTotalSalesOptions = {
    provider: AttributionModelComparison | null
    integrationId: string
    userTimezone: string
    filters: FilterType
    currency: string
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyProviderTotalSales = ({
    provider,
    integrationId,
    userTimezone,
    filters,
    currency,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyProviderTotalSalesOptions): MetricProps => {
    const enabled = !forceEmpty && provider !== null

    const trendFactory = aiJourneyProviderRevenueQueryFactory(provider)
    const timeSeriesFactory = aiJourneyProviderRevenueTimeSeriesQuery(provider)

    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        trendFactory(integrationId, filters, userTimezone, journeyIds),
        trendFactory(
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

    const { data: gmvInfluencedTimeSeriesData, isFetching: isFetchingSeries } =
        useTimeSeries(
            timeSeriesFactory(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
            undefined,
            enabled,
        )

    return {
        label: 'Provider Total Sales',
        value: forceEmpty || !enabled ? 0 : trendData?.value || 0,
        prevValue: forceEmpty || !enabled ? 0 : trendData?.prevValue,
        series:
            forceEmpty || !enabled
                ? []
                : (gmvInfluencedTimeSeriesData?.[0] ?? []),
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading:
            forceEmpty || !enabled
                ? false
                : isFetchingTrend || isFetchingSeries,
    }
}
