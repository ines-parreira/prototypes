import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyTotalContactsCompleteJourneyQueryFactory,
    aiJourneyTotalContactsCompleteJourneyTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useTotalContactsCompleteJourney = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    shopName: string,
    journeyIds?: string[],
): MetricProps => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        aiJourneyTotalContactsCompleteJourneyQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyTotalContactsCompleteJourneyQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
    )

    const {
        data: totalContactsCompleteJourneyTimeSeriesData,
        isFetching: isFetchingSeries,
    } = useTimeSeries(
        aiJourneyTotalContactsCompleteJourneyTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyIds,
        ),
    )

    return {
        label: 'Total Contacts Complete Journey',
        value: trendData?.value || 0,
        prevValue: trendData?.prevValue || 0,
        series: totalContactsCompleteJourneyTimeSeriesData[0],
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetchingTrend || isFetchingSeries,
    }
}
