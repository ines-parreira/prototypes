import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const resolutionCompletenessQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
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
    metricName: METRIC_NAMES.AUTO_QA_RESOLUTION_COMPLETENESS,
    ...(sorting
        ? {
              order: [
                  [
                      TicketQAScoreMeasure.AverageResolutionCompletenessScore,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const resolutionCompletenessPerAgentQueryFactory =
    perDimensionQueryFactory(
        resolutionCompletenessQueryFactory,
        TicketDimension.AssigneeUserId,
        METRIC_NAMES.AUTO_QA_RESOLUTION_COMPLETENESS_PER_AGENT,
    )

export const resolutionCompletenessDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...resolutionCompletenessQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AUTO_QA_RESOLUTION_COMPLETENESS_DRILL_DOWN,
    measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
