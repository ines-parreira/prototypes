import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneyTotalConversationsQueryFactory,
    aiJourneyTotalConversationsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import type { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalConversations = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        aiJourneyTotalConversationsQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalConversationsQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyId,
        ),
    )

    const { data: timeSeriesData, isFetching: isFetchingSeries } =
        useTimeSeries(
            aiJourneyTotalConversationsTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyId,
            ),
        )

    return {
        label: 'Total Conversations',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue,
        series: timeSeriesData?.[0] ?? [],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTrend || isFetchingSeries,
    }
}
