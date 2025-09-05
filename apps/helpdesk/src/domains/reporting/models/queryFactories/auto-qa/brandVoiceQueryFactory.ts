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

export const brandVoiceQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE,
    measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
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
              order: [[TicketQAScoreMeasure.AverageBrandVoiceScore, sorting]],
          }
        : {}),
})

export const brandVoicePerAgentQueryFactory = perDimensionQueryFactory(
    brandVoiceQueryFactory,
    TicketDimension.AssigneeUserId,
    METRIC_NAMES.AUTO_QA_BRAND_VOICE_PER_AGENT,
)

export const brandVoiceDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...brandVoiceQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE_DRILL_DOWN,
    measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
