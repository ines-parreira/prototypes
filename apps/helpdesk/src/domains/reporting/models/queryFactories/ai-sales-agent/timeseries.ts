import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { aiSalesAgentOrdersDefaultFiltersMembers } from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingFilter,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'

const createGmvTimeSeriesQuery = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    additionalFilters: ReportingFilter[] = [],
    measure:
        | AiSalesAgentOrdersMeasure.Gmv
        | AiSalesAgentOrdersMeasure.GmvUsd = AiSalesAgentOrdersMeasure.Gmv,
    dimensions: AiSalesAgentOrdersDimension[] = [],
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    return {
        measures: [measure],
        dimensions,
        timeDimensions: [
            {
                dimension: AiSalesAgentOrdersDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
        timezone,
        metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_TIME_SERIES,
        filters: [...baseFilters, ...additionalFilters],
    }
}

export const averageOrdersPerDayQuery = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [],
        timeDimensions: [
            {
                dimension: AiSalesAgentOrdersDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
        timezone,
        metricName: METRIC_NAMES.AI_SALES_AGENT_ORDERS_TIME_SERIES,
        filters: baseFilters,
    }
}

export const influencedGmvTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> =>
    createGmvTimeSeriesQuery(
        filters,
        timezone,
        granularity,
        [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
        AiSalesAgentOrdersMeasure.Gmv,
        [AiSalesAgentOrdersDimension.Currency],
    )

export const gmvTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> =>
    createGmvTimeSeriesQuery(
        filters,
        timezone,
        granularity,
        [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ],
        AiSalesAgentOrdersMeasure.Gmv,
        [AiSalesAgentOrdersDimension.Currency],
    )

export const gmvUsdTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> =>
    createGmvTimeSeriesQuery(
        filters,
        timezone,
        granularity,
        [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ],
        AiSalesAgentOrdersMeasure.GmvUsd,
    )
