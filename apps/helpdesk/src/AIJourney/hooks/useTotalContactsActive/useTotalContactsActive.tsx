import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneyTotalContactsActiveQueryFactory,
    aiJourneyTotalContactsActiveTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useTotalContactsActive = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyId?: string,
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        aiJourneyTotalContactsActiveQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalContactsActiveQueryFactory(
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
        data: totalContactsActiveTimeSeriesData,
        isFetching: isFetchingSeries,
    } = useTimeSeries(
        aiJourneyTotalContactsActiveTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )

    return {
        label: 'Total Active Contacts',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue || 0,
        series: totalContactsActiveTimeSeriesData[0],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTrend || isFetchingSeries,
    }
}
