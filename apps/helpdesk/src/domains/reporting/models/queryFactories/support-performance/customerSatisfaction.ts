import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { aiAgentTicketsDefaultFilters } from 'domains/reporting/models/queryFactories/automate_v2/filters'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { addFieldIdToCustomFieldValues } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const customerSatisfactionQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [],
    timezone,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters,
        ),
    ],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION,
})

export const customerSatisfactionForAIAgentTicketsQueryFactory = ({
    filters,
    timezone,
    sorting,
    intentFieldId,
    outcomeFieldId,
    aiAgentUserId,
    integrationIds,
    intentIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    intentFieldId?: number
    outcomeFieldId?: number
    aiAgentUserId?: number
    integrationIds?: string[]
    intentIds?: string[] | null
}): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_FOR_AI_AGENT_TICKETS,
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [],
    timezone,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        ...(aiAgentUserId
            ? [
                  {
                      member: TicketMember.AssigneeUserId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(aiAgentUserId)],
                  },
              ]
            : []),
        ...(intentFieldId && intentIds && intentIds.length > 0
            ? [
                  {
                      member: TicketMember.CustomField,
                      operator: ReportingFilterOperator.StartsWith,
                      values: addFieldIdToCustomFieldValues(
                          intentFieldId,
                          intentIds,
                      ),
                  },
              ]
            : [
                  {
                      member: TicketMember.CustomField,
                      operator: ReportingFilterOperator.StartsWith,
                      values: [`${intentFieldId}::`],
                  },
              ]),
        ...aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId,
            intentFieldId,
            integrationIds,
        }),
    ],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
})

export const customerSatisfactionMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        customerSatisfactionQueryFactory,
        TicketDimension.AssigneeUserId,
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_AGENT,
    )

export const customerSatisfactionMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        customerSatisfactionQueryFactory,
        CHANNEL_DIMENSION,
        METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_CHANNEL,
    )

export const customerSatisfactionMetricDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customerSatisfactionMetricPerAgentQueryFactory(
        filters,
        timezone,
        sorting,
    )
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_TICKET_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketSatisfactionSurveyDimension.SurveyScore,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [TicketSatisfactionSurveyDimension.SurveyScore, sorting],
                  ],
              }
            : {}),
    }
}
