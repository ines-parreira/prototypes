import { useMemo } from 'react'

import {
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalOrders = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
    granularity: ReportingGranularity,
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

    const { data: timeSeries, isFetching: isFetchingSeries } = useTimeSeries(
        aiJourneyTotalNumberOfOrderTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )
    const totalNumberOfOrderTimeSeriesData = useMemo(
        () => getStatsByMeasure(AiSalesAgentOrdersMeasure.Count, timeSeries),
        [timeSeries],
    )

    return {
        label: 'Total Orders',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue || 0,
        series: totalNumberOfOrderTimeSeriesData,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTred || isFetchingSeries,
    }
}
