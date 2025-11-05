import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalOrders = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyId?: string,
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTred } = useMetricTrend(
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyId,
        ),
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
            journeyId,
        ),
    )

    return {
        label: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue || 0,
        series: totalNumberOfOrderTimeSeriesData?.[0] ?? [],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTred || isFetchingSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId,
            journeyId,
            shopName,
        },
    }
}
