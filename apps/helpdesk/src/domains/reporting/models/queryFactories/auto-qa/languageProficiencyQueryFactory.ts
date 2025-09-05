import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreMeasure,
} from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const languageProficiencyQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY,
    measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketDimension.Status,
            operator: ReportingFilterOperator.Equals,
            values: [TicketStatus.Closed],
        },
    ],
    timezone,
    ...(sorting
        ? {
              order: [
                  [
                      TicketQAScoreMeasure.AverageLanguageProficiencyScore,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const languageProficiencyPerAgentQueryFactory = perDimensionQueryFactory(
    languageProficiencyQueryFactory,
    TicketDimension.AssigneeUserId,
    METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY_PER_AGENT,
)

export const languageProficiencyDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...languageProficiencyQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY_DRILL_DOWN,
    measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
