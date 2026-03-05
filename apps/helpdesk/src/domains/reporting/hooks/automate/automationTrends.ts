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
import { automatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import type {
    BuiltQuery,
    Context,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { MeasureName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useTrendFromMultipleMetricsTrend = <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    filters: StatsFilters,
    timezone: string,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
    ) => ReportingQuery<TCube>,
    metric: Metric,
    queryFactoryV2?: (ctx: Context<TMeta>) => BuiltQuery<TMeta>,
    metricV2?: MeasureName,
    enabled: boolean = true,
) => {
    const trendData = useMultipleMetricsTrends(
        queryFactory(filters, timezone),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        queryFactoryV2?.({ filters, timezone }),
        queryFactoryV2?.({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
        enabled,
    )

    const data =
        metricV2 && metricV2 in trendData.data
            ? trendData.data?.[metricV2 as Metric]
            : trendData.data?.[metric]

    return {
        data,
        isFetching: trendData.isFetching,
        isError: trendData.isError,
    }
}

export const fetchTrendFromMultipleMetricsTrend = async <
    Metric extends Cubes['measures'],
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    filters: StatsFilters,
    timezone: string,
    queryFactory: (
        filters: StatsFilters,
        timezone: string,
    ) => ReportingQuery<TCube>,
    metric: Metric,
    queryFactoryV2?: (ctx: Context<TMeta>) => BuiltQuery<TMeta>,
    metricV2?: MeasureName,
) =>
    fetchMultipleMetricsTrends(
        queryFactory(filters, timezone),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        queryFactoryV2?.({ filters, timezone }),
        queryFactoryV2?.({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    ).then((result) => {
        const data =
            metricV2 && metricV2 in result.data
                ? result.data?.[metricV2 as Metric]
                : result.data?.[metric]

        return {
            data,
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
    enabled: boolean = true,
) => {
    const filteredAutomatedInteractionsData = useMultipleMetricsTrends(
        queryFactory(filters, timezone, dimensionId),
        queryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            dimensionId,
        ),
        undefined,
        undefined,
        enabled,
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractions',
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractions',
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractionsByAutoResponders',
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractionsByAutoResponders',
    )

export const useAllAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string,
    enabled: boolean = true,
) =>
    useTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        automatedInteractionsQueryV2Factory,
        'automatedInteractions',
        enabled,
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

export const useAllAutomatedInteractionsByAutoResponders = (
    filters: StatsFilters,
    timezone: string,
    enabled: boolean = true,
) =>
    useTrendFromMultipleMetricsTrend(
        { period: filters.period },
        timezone,
        automationDatasetQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
        automatedInteractionsQueryV2Factory,
        'automatedInteractionsByAutoResponders',
        enabled,
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
        automatedInteractionsQueryV2Factory,
        'automatedInteractionsByAutoResponders',
    )

export const useBillableTicketsExcludingAIAgent = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
    enabled: boolean = true,
) =>
    useTrendFromMultipleMetricsTrendPerDimension(
        filters,
        timezone,
        aiAgentUserId,
        billableTicketDatasetExcludingAIAgentQueryFactory,
        BillableTicketDatasetMeasure.BillableTicketCount,
        enabled,
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
