import { useMemo } from 'react'

import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneyTotalContactsCompleteJourneyQueryFactory,
    aiJourneyTotalContactsCompleteJourneyTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useTotalContactsCompleteJourney = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyId?: string,
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        aiJourneyTotalContactsCompleteJourneyQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalContactsCompleteJourneyQueryFactory(
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
        aiJourneyTotalContactsCompleteJourneyTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )

    const totalContactsCompleteJourneyTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentConversationsMeasure.Count,
                timeSeries,
            ),
        [timeSeries],
    )

    return {
        label: 'Total Contacts Complete Journey',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue || 0,
        series: totalContactsCompleteJourneyTimeSeriesData,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTrend || isFetchingSeries,
    }
}
