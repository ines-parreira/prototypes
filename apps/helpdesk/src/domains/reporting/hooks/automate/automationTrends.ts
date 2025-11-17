import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'domains/reporting/hooks/useMultipleMetricsTrend'
import type { Cubes } from 'domains/reporting/models/cubes'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import {
    automationDatasetQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
    billableTicketDatasetQueryFactory,
    billableTicketDatasetResolvedByAIAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useTrendFromMultipleMetricsTrend = <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
>(
    filters: StatsFilters,
    timezone: string,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
    ) => ReportingQuery<TCube>,
    metric: Metric,
) => {
    const trendData = useMultipleMetricsTrends(
        queryFactory(filters, timezone),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
    )

    return {
        data: trendData.data?.[metric],
        isFetching: trendData.isFetching,
        isError: trendData.isError,
    }
}

export const fetchTrendFromMultipleMetricsTrend = async <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
>(
    filters: StatsFilters,
    timezone: string,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
    ) => ReportingQuery<TCube>,
    metric: Metric,
) =>
    fetchMultipleMetricsTrends(
        queryFactory(filters, timezone),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
    ).then((result) => {
        return {
            data: result.data?.[metric],
            isFetching: result.isFetching,
            isError: result.isError,
        }
    })

export const useTrendFromMultipleMetricsTrendPerDimension = <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
>(
    filters: StatsFilters,
    timezone: string,
    dimensionId: number | undefined,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
        dimensionId: number | undefined,
    ) => ReportingQuery<TCube>,
    metric: Metric,
) => {
    const filteredAutomatedInteractionsData = useMultipleMetricsTrends(
        queryFactory(filters, timezone, dimensionId),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            dimensionId,
        ),
    )

    return {
        data: filteredAutomatedInteractionsData.data?.[metric],
        isFetching: filteredAutomatedInteractionsData.isFetching,
        isError: filteredAutomatedInteractionsData.isError,
    }
}

export const fetchTrendFromMultipleMetricsTrendPerDimension = <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
>(
    filters: StatsFilters,
    timezone: string,
    dimensionId: number | undefined,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
        dimensionId: number | undefined,
    ) => ReportingQuery<TCube>,
    metric: Metric,
) => {
    return fetchMultipleMetricsTrends(
        queryFactory(filters, timezone, dimensionId),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            dimensionId,
        ),
    ).then((result) => {
        return {
            data: result.data?.[metric],
            isFetching: false,
            isError: false,
        }
    })
}

export const useFilteredAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )

export const fetchFilteredAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )

export const useFilteredAutomatedInteractionsByAutoResponders = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    )

export const fetchFilteredAutomatedInteractionsByAutoResponders = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    )

export const useAllAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )

export const fetchAllAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )

export const useAllAutomatedInteractionsByAutoResponders = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    )

export const fetchAllAutomatedInteractionsByAutoResponders = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    )

export const useBillableTicketsExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    useTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.BillableTicketCount,
    )
export const fetchBillableTicketsExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    fetchTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.BillableTicketCount,
    )

export const useFirstResponseTimeExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    useTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
    )

export const fetchFirstResponseTimeExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    fetchTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
    )

export const useResolutionTimeExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    useTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    )

export const fetchResolutionTimeExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    fetchTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    )

export const useFirstResponseTimeIncludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        billableTicketDatasetQueryFactory,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
    )

export const fetchFirstResponseTimeIncludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        billableTicketDatasetQueryFactory,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
    )

export const useResolutionTimeResolvedByAIAgent = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        billableTicketDatasetResolvedByAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    )

export const fetchResolutionTimeResolvedByAIAgent = async (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        billableTicketDatasetResolvedByAIAgentQueryFactory,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    )
}
