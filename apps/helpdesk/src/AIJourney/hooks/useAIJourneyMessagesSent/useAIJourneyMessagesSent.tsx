import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyTotalMessagesQueryFactory,
    aiJourneyTotalMessagesTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIJourneyMessagesSent = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        aiJourneyTotalMessagesQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyTotalMessagesQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
    )

    const { data: timeSeriesData, isFetching: isFetchingSeries } =
        useTimeSeries(
            aiJourneyTotalMessagesTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
        )

    return {
        label: 'Messages sent',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue,
        series: timeSeriesData?.[0] ?? [],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTrend || isFetchingSeries,
    }
}
