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

type UseAIJourneyMessagesSentOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyMessagesSent = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyMessagesSentOptions): MetricProps => {
    const enabled = !forceEmpty

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
        undefined,
        undefined,
        enabled,
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
            undefined,
            enabled,
        )

    return {
        label: 'Messages sent',
        value: forceEmpty ? 0 : trendData?.value || 0,
        prevValue: forceEmpty ? 0 : trendData?.prevValue,
        series: forceEmpty ? [] : (timeSeriesData?.[0] ?? []),
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: forceEmpty ? false : isFetchingTrend || isFetchingSeries,
    }
}
