import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyProviderTotalNumberOfOrderQueryFactory,
    aiJourneyProviderTotalNumberOfOrderTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import type { AttributionModelComparison } from 'AIJourney/utils/attributionModelComparison'
import { useMetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyProviderTotalOrdersOptions = {
    provider: AttributionModelComparison | null
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyProviderTotalOrders = ({
    provider,
    integrationId,
    userTimezone,
    filters,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyProviderTotalOrdersOptions): MetricProps => {
    const enabled = !forceEmpty && provider !== null

    const trendFactory =
        aiJourneyProviderTotalNumberOfOrderQueryFactory(provider)
    const timeSeriesFactory =
        aiJourneyProviderTotalNumberOfOrderTimeSeriesQuery(provider)

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

    const {
        data: totalNumberOfOrderTimeSeriesData,
        isFetching: isFetchingSeries,
    } = useTimeSeries(
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
        label: 'Provider Orders',
        value: forceEmpty || !enabled ? 0 : trendData?.value || 0,
        prevValue: forceEmpty || !enabled ? 0 : trendData?.prevValue || 0,
        series:
            forceEmpty || !enabled
                ? []
                : (totalNumberOfOrderTimeSeriesData?.[0] ?? []),
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading:
            forceEmpty || !enabled
                ? false
                : isFetchingTrend || isFetchingSeries,
    }
}
