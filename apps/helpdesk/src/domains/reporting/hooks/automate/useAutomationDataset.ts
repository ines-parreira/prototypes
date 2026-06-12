import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import type { AutomateTimeseries as CalculatedTimeSeries } from 'domains/reporting/hooks/automate/types'
import { AutomateTrendMetrics } from 'domains/reporting/hooks/automate/types'
import {
    fetchAutomationRateTimeSeriesData,
    useAutomationRateTimeSeriesData,
} from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { useDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { fetchFilteredAutomatedInteractionsSeries } from 'domains/reporting/hooks/automate/useFilteredAutomatedInteractionsSeries'
import { automateInteractionsByEventTypeToTimeSeries } from 'domains/reporting/hooks/automate/utils'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export const useAutomateMetricsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): CalculatedTimeSeries => {
    const filteredAutomatedInteractionsDataByEventType =
        useAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity,
        )

    const filteredAutomatedInteractionsSeries = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity,
    )

    const automationRates = useAutomationRateTimeSeriesData(
        filters,
        timezone,
        granularity,
    )

    return {
        isFetching:
            filteredAutomatedInteractionsSeries.isFetching ||
            filteredAutomatedInteractionsDataByEventType.isFetching ||
            automationRates.isFetching,
        isError:
            filteredAutomatedInteractionsSeries.isError ||
            filteredAutomatedInteractionsDataByEventType.isError ||
            automationRates.isError,
        automationRateTimeSeries: automationRates.data,
        automatedInteractionTimeSeries:
            filteredAutomatedInteractionsSeries.data,
        automatedInteractionByEventTypesTimeSeries:
            automateInteractionsByEventTypeToTimeSeries(
                filters,
                granularity,
                filteredAutomatedInteractionsDataByEventType.data,
            ),
    }
}

export const fetchAutomateMetricsTimeSeries = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId: number | undefined,
): Promise<CalculatedTimeSeries> => {
    return Promise.all([
        fetchAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity,
        ),
        fetchFilteredAutomatedInteractionsSeries(
            filters,
            timezone,
            granularity,
        ),
        fetchAutomationRateTimeSeriesData(
            filters,
            timezone,
            granularity,
            aiAgentUserId,
        ),
    ]).then(
        ([
            filteredAutomatedInteractionsDataByEventType,
            filteredAutomatedInteractionsSeries,
            automationRates,
        ]) => {
            return {
                isFetching: false,
                isError: false,
                automationRateTimeSeries: automationRates.data,
                automatedInteractionTimeSeries:
                    filteredAutomatedInteractionsSeries.data,
                automatedInteractionByEventTypesTimeSeries:
                    automateInteractionsByEventTypeToTimeSeries(
                        filters,
                        granularity,
                        filteredAutomatedInteractionsDataByEventType,
                    ),
            }
        },
    )
}

export const useAutomateMetricsTrend = (
    filters: StatsFilters,
    timezone: string,
): Record<AutomateTrendMetrics, MetricTrend> => {
    const automationRate = useAutomationRateTrend(filters, timezone)
    const filteredAutomatedInteractions = useFilteredAutomatedInteractions(
        filters,
        timezone,
    )

    const decreaseInFirstResponseTime = useDecreaseInFirstResponseTimeTrend(
        filters,
        timezone,
    )

    const decreaseInResolutionTime = useDecreaseInResolutionTimeTrend(
        filters,
        timezone,
    )

    return {
        [AutomateTrendMetrics.AutomationRate]: automationRate,
        [AutomateTrendMetrics.Interactions]: filteredAutomatedInteractions,
        [AutomateTrendMetrics.DecreaseInFirstResponseTime]:
            decreaseInFirstResponseTime,
        [AutomateTrendMetrics.DecreaseInResolutionTime]:
            decreaseInResolutionTime,
    }
}
