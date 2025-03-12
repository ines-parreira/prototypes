import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    isFilterWithLogicalOperator,
    withLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import {
    FilterKey,
    LegacyStatsFilters,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketSatisfactionSurveyDimension.SurveyScore,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
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
