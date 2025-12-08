import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    isFilterWithLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import type {
    LegacyStatsFilters,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export enum SatisfactionSurveyScore {
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
}

export const averageScoreQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE,
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        ...NotSpamNorTrashedTicketsFilter,
    ],
    timezone,
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
})

export const averageScoreDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...averageScoreQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE_DRILL_DOWN,
    dimensions: [TicketDimension.TicketId],
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    limit: DRILLDOWN_QUERY_LIMIT,
})

export const averageScoreDrillDownWithScoreQueryBuilder =
    (score: SatisfactionSurveyScore) =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
    ) => {
        const areFiltersWithLogicalOperator = Object.values(FilterKey).some(
            (val) =>
                val !== FilterKey.Period &&
                val !== FilterKey.AggregationWindow &&
                isFilterWithLogicalOperator(statsFilters?.[val] || []),
        )
        const statsFiltersWithLogicalOperators = areFiltersWithLogicalOperator
            ? (statsFilters as StatsFiltersWithLogicalOperator)
            : fromLegacyStatsFilters(statsFilters as LegacyStatsFilters)

        return averageScoreDrillDownQueryFactory(
            {
                ...statsFiltersWithLogicalOperators,
                score: withLogicalOperator([score]),
            },
            timezone,
            sorting,
        )
    }
