import {useFilteredAutomatedInteractions} from 'hooks/reporting/automate/automationTrends'
import {
    fetchAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {
    AutomateTimeseries as CalculatedTimeSeries,
    AutomateTrendMetrics,
} from 'hooks/reporting/automate/types'
import {
    fetchAutomationRateTimeSeriesData,
    useAutomationRateTimeSeriesData,
} from 'hooks/reporting/automate/useAutomationRateTimeSeriesData'
import {useAutomationRateTrend} from 'hooks/reporting/automate/useAutomationRateTrend'
import {useDecreaseInFirstResponseTimeTrend} from 'hooks/reporting/automate/useDecreaseInFirstResponseTimeTrend'
import {useDecreaseInResolutionTimeTrend} from 'hooks/reporting/automate/useDecreaseInResolutionTimeTrend'
import {
    fetchFilteredAutomatedInteractionsSeries,
    useFilteredAutomatedInteractionsSeries,
} from 'hooks/reporting/automate/useFilteredAutomatedInteractionsSeries'
import {automateInteractionsByEventTypeToTimeSeries} from 'hooks/reporting/automate/utils'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'

import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const useAutomateMetricsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): CalculatedTimeSeries => {
    const filteredAutomatedInteractionsDataByEventType =
        useAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity
        )
    const filteredAutomatedInteractionsSeries =
        useFilteredAutomatedInteractionsSeries(filters, timezone, granularity)

    const automationRates = useAutomationRateTimeSeriesData(
        filters,
        timezone,
        granularity
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
                filteredAutomatedInteractionsDataByEventType.data
            ),
    }
}

export const fetchAutomateMetricsTimeSeries = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: string | undefined
): Promise<CalculatedTimeSeries> => {
    return Promise.all([
        fetchAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity
        ),
        fetchFilteredAutomatedInteractionsSeries(
            filters,
            timezone,
            granularity
        ),
        fetchAutomationRateTimeSeriesData(
            filters,
            timezone,
            granularity,
            isAutomateNonFilteredDenominatorInAutomationRate,
            aiAgentUserId
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
                        filteredAutomatedInteractionsDataByEventType
                    ),
            }
        }
    )
}

export const useAutomateMetricsTrend = (
    filters: StatsFilters,
    timezone: string
): Record<AutomateTrendMetrics, MetricTrend> => {
    const automationRate = useAutomationRateTrend(filters, timezone)
    const filteredAutomatedInteractions = useFilteredAutomatedInteractions(
        filters,
        timezone
    )

    const decreaseInFirstResponseTime = useDecreaseInFirstResponseTimeTrend(
        filters,
        timezone
    )

    const decreaseInResolutionTime = useDecreaseInResolutionTimeTrend(
        filters,
        timezone
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
