import {StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'

import {
    useAutomationRateTimeSeries,
    useAutomatedInteractionTimeSeries,
    useAutomatedInteractionByEventTypesTimeSeries,
} from 'hooks/reporting/timeSeries'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    useFirstResponseTimeWithAutomationTrend,
    useDecreaseInResolutionTimeWithAutomationTrend,
    useAutomationRateTrend,
    useAutomatedInteractionsTrend,
} from 'hooks/reporting/metricTrends'
import {AutomateTimeseries, AutomateTrendMetrics} from './types'

export const useAutomateMetricsTimeseries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): AutomateTimeseries => {
    const automationRateTimeSeries = useAutomationRateTimeSeries(
        filters,
        timezone,
        granularity
    )
    const automatedInteractionTimeSeries = useAutomatedInteractionTimeSeries(
        filters,
        timezone,
        granularity
    )
    const automatedInteractionByEventTypesTimeSeries =
        useAutomatedInteractionByEventTypesTimeSeries(
            filters,
            timezone,
            granularity
        )
    const calculatedData: AutomateTimeseries = {
        isFetching:
            automationRateTimeSeries.isFetching ||
            automatedInteractionTimeSeries.isFetching ||
            automatedInteractionByEventTypesTimeSeries.isFetching,
        isError:
            automationRateTimeSeries.isError ||
            automatedInteractionTimeSeries.isError ||
            automatedInteractionByEventTypesTimeSeries.isError,
        automationRateTimeSeries: automationRateTimeSeries.data || [],
        automatedInteractionTimeSeries:
            automatedInteractionTimeSeries.data || [],
        automatedInteractionByEventTypesTimeSeries:
            automatedInteractionByEventTypesTimeSeries.data || [],
    }

    return calculatedData
}

export const useAutomateMetricsTrend = (
    filters: StatsFilters,
    timezone: string
): Record<AutomateTrendMetrics, MetricTrend> => {
    const firstResponseTimeTrend = useFirstResponseTimeWithAutomationTrend(
        filters,
        timezone
    )

    const decreaseInResolutionTimeWithAutomationTrend =
        useDecreaseInResolutionTimeWithAutomationTrend(filters, timezone)

    const automationRateTrend = useAutomationRateTrend(filters, timezone)
    const automatedInteractionTrend = useAutomatedInteractionsTrend(
        filters,
        timezone
    )
    return {
        automatedInteractionTrend: automatedInteractionTrend,
        automationRateTrend: automationRateTrend,
        decreaseInResolutionTimeTrend:
            decreaseInResolutionTimeWithAutomationTrend,
        decreaseInFirstResponseTimeTrend: firstResponseTimeTrend,
    }
}
