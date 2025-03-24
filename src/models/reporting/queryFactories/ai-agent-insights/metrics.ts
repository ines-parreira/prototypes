import { OrderDirection } from 'models/api/types'
import {
    RecommendedResourcesCube,
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    aiAgentTicketsDefaultFilters,
    recommendedResourceDatasetDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {
    addFieldIdToCustomFieldValues,
    countUniquePrefixes,
} from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const AI_INTENT_TO_EXCLUDE = 'Other::No Reply'
export const AI_OUTCOME_TO_EXCLUDE = 'Close::Without message'
export const AI_AGENT_TICKETS_CHANNELS = [
    'email',
    'chat',
    'contact_form',
    'help-center',
]

export const customerSatisfactionPerIntentLevelQueryFactory = ({
    filters,
    timezone,
    sorting,
    assigneeUserId,
    intentFieldId,
    outcomeFieldId,
}: {
    filters: StatsFilters
    timezone: string
    sorting?: OrderDirection
    assigneeUserId?: string
    intentFieldId?: number
    outcomeFieldId?: number
}): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const customFiledFilters = []
    if (assigneeUserId) {
        customFiledFilters.push({
            member: TicketMember.AssigneeUserId,
            operator: ReportingFilterOperator.Equals,
            values: [assigneeUserId],
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
            ...(customFiledFilters ? customFiledFilters : []),
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeFieldId}::`],
            },
            ...aiAgentTicketsDefaultFilters({
                filters,
                intentFieldId: intentFieldId,
                outcomeFieldId: outcomeFieldId,
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
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId: number
    customFieldFilter?: string
    sorting?: OrderDirection
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
                intentFieldId,
                outcomeFieldId,
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
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    outcomeFieldId: number
    sorting?: OrderDirection
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
                intentFieldId,
                outcomeFieldId,
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
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    operator?: ReportingFilterOperator
    customFieldFilter?: string
    sorting?: OrderDirection
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
                intentFieldId,
                outcomeFieldId,
                outcomeValuesToExclude,
            }),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}
