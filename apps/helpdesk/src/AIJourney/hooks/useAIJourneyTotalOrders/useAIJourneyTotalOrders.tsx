import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalOrdersOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    shopName: string
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyTotalOrders = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    shopName,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalOrdersOptions): MetricProps => {
    const enabled = !forceEmpty

    const { data: trendData, isFetching: isFetchingTred } = useMetricTrend(
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyTotalNumberOfOrderQueryFactory(
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
        aiJourneyTotalNumberOfOrderTimeSeriesQuery(
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
        label: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
        value: forceEmpty ? 0 : trendData?.value || 0,
        prevValue: forceEmpty ? 0 : trendData?.prevValue || 0,
        series: forceEmpty ? [] : (totalNumberOfOrderTimeSeriesData?.[0] ?? []),
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: forceEmpty ? false : isFetchingTred || isFetchingSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId,
            journeyIds,
            shopName,
        },
    }
}
