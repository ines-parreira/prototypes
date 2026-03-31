import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyReplyRateQueryFactory,
    aiJourneyReplyRateTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyResponseRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyResponseRate = ({
    integrationId,
    userTimezone,
    filters,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyResponseRateOptions): MetricProps => {
    const enabled = !forceEmpty

    const { data: replyRateData, isFetching: isFetchingReplyRate } =
        useMetricTrend(
            aiJourneyReplyRateQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyIds,
            ),
            aiJourneyReplyRateQueryFactory(
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

    const { data: timeSeriesData, isFetching: isFetchingTimeSeries } =
        useTimeSeries(
            aiJourneyReplyRateTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
            undefined,
            enabled,
        )

    const series = useMemo(() => {
        if (!timeSeriesData?.length) {
            return []
        }
        return timeSeriesData[0] ?? []
    }, [timeSeriesData])

    return {
        label: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
        value: forceEmpty ? 0 : (replyRateData?.value ?? 0),
        prevValue: forceEmpty ? 0 : (replyRateData?.prevValue ?? 0),
        series: forceEmpty ? [] : series,
        interpretAs: 'more-is-better',
        metricFormat: 'percent-precision-1',
        isLoading: forceEmpty
            ? false
            : isFetchingReplyRate || isFetchingTimeSeries,
        drilldown: {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
            metricName: AIJourneyMetric.ResponseRate,
            integrationId,
            journeyIds,
        },
    }
}
