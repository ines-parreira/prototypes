import {
    AutomatedTicketsCube,
    AutomatedTicketsFilterMember,
    AutomatedTicketsMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomatedTicketsCube'
import {
    RecommendedResourcesCube,
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { AI_AGENT_TICKETS_CHANNELS } from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import {
    aiAgentTicketsDefaultFilters,
    recommendedResourceDatasetDefaultFilters,
} from 'domains/reporting/models/queryFactories/automate_v2/filters'
import {
    addFieldIdToCustomFieldValues,
    countUniquePrefixes,
} from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const customerSatisfactionPerIntentLevelQueryFactory = ({
    filters,
    timezone,
    sorting,
    assigneeUserId,
    intentFieldId,
    outcomeFieldId,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    assigneeUserId?: number
    intentFieldId?: number
    outcomeFieldId?: number
    integrationIds?: string[]
}): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const ticketAssigneeFilter = []
    if (assigneeUserId) {
        ticketAssigneeFilter.push({
            member: TicketMember.AssigneeUserId,
            operator: ReportingFilterOperator.Equals,
            values: [String(assigneeUserId)],
        })
    }

    return {
        measures: [
            TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        ],
        dimensions: [
            TicketSatisfactionSurveyDimension.TicketId,
            TicketSatisfactionSurveyDimension.SurveyScore,
        ],
        timezone,
        segments: [TicketSatisfactionSurveySegment.SurveyScored],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            ...ticketAssigneeFilter,
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeFieldId}::`],
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                outcomeFieldId: outcomeFieldId,
                intentFieldId: intentFieldId,
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
    }
}

export const recommendedResourceQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    ticketIds: string[],
    sorting?: OrderDirection,
): ReportingQuery<RecommendedResourcesCube> => ({
    measures: [RecommendedResourcesMeasure.NumRecommendedResources],
    dimensions: [
        RecommendedResourcesDimension.TicketId,
        RecommendedResourcesDimension.RecommendedResourceId,
    ],
    timezone,
    filters: [
        ...recommendedResourceDatasetDefaultFilters(statsFilters),
        {
            member: RecommendedResourcesFilterMember.TicketId,
            operator: ReportingFilterOperator.In,
            values: ticketIds,
        },
    ],
    ...(sorting
        ? {
              order: [[RecommendedResourcesDimension.TicketId, sorting]],
          }
        : {}),
})

export const aiAgentTicketsWithIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId?: number,
    ticketIds?: string[],
    sorting?: OrderDirection,
    intentId?: string,
): ReportingQuery<TicketCubeWithJoins> => {
    return {
        measures: [],
        dimensions: [TicketDimension.TicketId, TicketDimension.CustomField],
        timezone,
        filters: [
            ...(intentFieldId
                ? [
                      {
                          member: TicketMember.CustomField,
                          operator: ReportingFilterOperator.StartsWith,
                          values: [
                              ...addFieldIdToCustomFieldValues(intentFieldId, [
                                  intentId || '',
                              ]),
                          ],
                      },
                  ]
                : []),
            ...(ticketIds && ticketIds?.length > 0
                ? [
                      {
                          member: TicketDimension.TicketId,
                          operator: ReportingFilterOperator.In,
                          values: ticketIds,
                      },
                  ]
                : []),
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
        ],
        ...(sorting
            ? {
                  order: [
                      [
                          TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                          sorting,
                      ],
                  ],
              }
            : {}),
    }
}

export const aiAgentTouchedTicketTotalCountQueryFactory = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,
    customFieldFilter = '',
    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId: number
    customFieldFilter?: string
    sorting?: OrderDirection
    integrationIds?: string[]
}): ReportingQuery<TicketCubeWithJoins> => {
    const customFieldsValuesToMatch = [
        ...addFieldIdToCustomFieldValues(outcomeFieldId, [customFieldFilter]),
    ]

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        segments: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketMember.TotalCustomFieldIdsToMatch,
                operator: ReportingFilterOperator.Equals,
                values: [
                    String(countUniquePrefixes(customFieldsValuesToMatch)),
                ],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: customFieldsValuesToMatch,
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                outcomeFieldId,
                intentFieldId,
                integrationIds,
            }),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const allTicketsForAiAgentTotalCountQueryFactory = ({
    filters,
    timezone,
    intentFieldId,
    outcomeFieldId,
    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    outcomeFieldId: number
    sorting?: OrderDirection
    integrationIds?: string[]
}): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketMember.Channel,
                operator: ReportingFilterOperator.Equals,
                values: AI_AGENT_TICKETS_CHANNELS,
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                outcomeFieldId,
                intentFieldId,
                integrationIds,
            }),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const aiAgentTouchedTicketQueryFactory = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,
    operator = ReportingFilterOperator.Contains,
    customFieldFilter = '',
    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    operator?: ReportingFilterOperator
    customFieldFilter?: string
    sorting?: OrderDirection
    integrationIds?: string[]
}): ReportingQuery<TicketCubeWithJoins> => {
    const outcomeValuesToInclude =
        operator === ReportingFilterOperator.Contains
            ? addFieldIdToCustomFieldValues(outcomeFieldId, [customFieldFilter])
            : [`${outcomeFieldId}::`]
    const outcomeValuesToExclude =
        operator !== ReportingFilterOperator.Contains
            ? [`${outcomeFieldId}::${customFieldFilter}`]
            : []

    const customFieldsValuesToMatch = [
        `${intentFieldId}::`,
        ...outcomeValuesToInclude,
    ]

    return {
        measures: [],
        dimensions: [TicketDimension.TicketId],
        timezone,
        segments: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketMember.TotalCustomFieldIdsToMatch,
                operator: ReportingFilterOperator.Equals,
                values: [
                    String(countUniquePrefixes(customFieldsValuesToMatch)),
                ],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: customFieldsValuesToMatch,
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                outcomeFieldId,
                intentFieldId,
                outcomeValuesToExclude,
                integrationIds,
            }),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const AiAgentAutomatedInteractionsTicketsQueryFactory = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,

    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId?: number
    intentFieldId?: number
    sorting?: OrderDirection
    integrationIds?: string[]
}): ReportingQuery<TicketCubeWithJoins> => {
    const customFieldsValuesToMatch = [`${outcomeFieldId}::`]

    return {
        measures: [],
        dimensions: [TicketDimension.TicketId],
        timezone,
        segments: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketMember.TotalCustomFieldIdsToMatch,
                operator: ReportingFilterOperator.Equals,
                values: [
                    String(countUniquePrefixes(customFieldsValuesToMatch)),
                ],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: customFieldsValuesToMatch,
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                outcomeFieldId,
                intentFieldId,
                integrationIds,
                ignoreOutcomeFieldId: true,
            }),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const aiAgentAutomatedTicketCountQueryFactory = ({
    filters,
    timezone,
    ticketIds,
    sorting,
}: {
    filters: StatsFilters
    timezone: string
    ticketIds?: string[]
    sorting?: OrderDirection
}): ReportingQuery<AutomatedTicketsCube> => ({
    measures: [AutomatedTicketsMeasure.NumAutomatedTickets],
    dimensions: [],
    timezone,
    filters: [
        {
            member: AutomatedTicketsFilterMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [formatReportingQueryDate(filters.period.start_datetime)],
        },
        {
            member: AutomatedTicketsFilterMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(filters.period.end_datetime)],
        },
        {
            member: AutomatedTicketsFilterMember.TicketId,
            operator: ReportingFilterOperator.Equals,
            values: ticketIds && ticketIds.length > 0 ? ticketIds : ['0'],
        },
    ],
    ...(sorting
        ? {
              order: [[AutomatedTicketsMeasure.NumAutomatedTickets, sorting]],
          }
        : {}),
})
