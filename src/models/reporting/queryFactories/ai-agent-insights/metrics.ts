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
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import { recommendedResourceDatasetDefaultFilters } from '../automate_v2/filters'

export const customerSatisfactionPerIntentLevelQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    assigneeUserId?: string,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
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
                statsFilters,
            ),
            ...(customFiledFilters ? customFiledFilters : []),
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
    customFieldId: string | null,
    sorting?: OrderDirection,
    intentId?: string,
): ReportingQuery<TicketCubeWithJoins> => {
    return {
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        ],
        timezone,
        filters: [
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
            ...(intentId
                ? [
                      {
                          member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                          operator: ReportingFilterOperator.StartsWith,
                          values: [intentId],
                      },
                  ]
                : []),
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
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
