import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { aiSalesAgentOrdersDefaultFilters } from 'models/reporting/queryFactories/ai-sales-agent/filters'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getFilterDateRange } from 'utils/reporting'

const createGmvTimeSeriesQuery = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    additionalFilters: ReportingFilter[] = [],
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = aiSalesAgentOrdersDefaultFilters(filters)

    return {
        measures: [AiSalesAgentOrdersMeasure.Gmv],
        dimensions: [],
        timeDimensions: [
            {
                dimension: AiSalesAgentOrdersDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
        timezone,
        filters: [...baseFilters, ...additionalFilters],
    }
}

export const influencedGmvTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> =>
    createGmvTimeSeriesQuery(filters, timezone, granularity, [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
    ])

export const gmvTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AiSalesAgentOrdersCube> =>
    createGmvTimeSeriesQuery(filters, timezone, granularity, [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['0'],
        },
    ])
