import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyGmvInfluencedQueryFactory,
    aiJourneyGmvInfluencedTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

export const useAIJourneyGmvInfluenced = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): MetricProps => {
    const { currency } = useCurrency()

    const { data: tendData, isFetching: isFetchingTred } = useMetricTrend(
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
    )

    const { data: gmvInfluencedTimeSeriesData, isFetching: isFetchingSeries } =
        useTimeSeries(
            aiJourneyGmvInfluencedTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
        )

    return {
        label: 'Total Revenue',
        value: tendData?.value || 0,
        prevValue: tendData?.prevValue,
        series: gmvInfluencedTimeSeriesData?.[0] ?? [],
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: isFetchingTred || isFetchingSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId,
            journeyIds,
        },
    }
}
