import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyRevenueQueryFactory,
    aiJourneyRevenueTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalSalesOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    currency: string
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyTotalSales = ({
    integrationId,
    userTimezone,
    filters,
    currency,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalSalesOptions): MetricProps => {
    const enabled = !forceEmpty

    const { data: trendData, isFetching: isFetchingTred } = useMetricTrend(
        aiJourneyRevenueQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyRevenueQueryFactory(
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
            aiJourneyRevenueTimeSeriesQuery(
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
        label: 'Total Revenue',
        value: forceEmpty ? 0 : trendData?.value || 0,
        prevValue: forceEmpty ? 0 : trendData?.prevValue,
        series: forceEmpty ? [] : (gmvInfluencedTimeSeriesData?.[0] ?? []),
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: forceEmpty ? false : isFetchingTred || isFetchingSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId,
            journeyIds,
        },
    }
}
