import { useMemo } from 'react'

import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneyGmvInfluencedQueryFactory,
    aiJourneyGmvInfluencedTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyGmvInfluenced = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: tendData, isFetching: isFetchingTred } = useMetricTrend(
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyGmvInfluencedQueryFactory(
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
        aiJourneyGmvInfluencedTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )
    const gmvInfluencedTimeSeriesData = useMemo(
        () => getStatsByMeasure(AiSalesAgentOrdersMeasure.GmvUsd, timeSeries),
        [timeSeries],
    )

    return {
        label: 'Total Revenue',
        value: tendData?.value || 0,
        prevValue: tendData?.prevValue,
        series: gmvInfluencedTimeSeriesData,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: isFetchingTred || isFetchingSeries,
    }
}
