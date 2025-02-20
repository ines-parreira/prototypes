import {OrderDirection} from 'models/api/types'
import {
    RecommendedResourcesCube,
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import {recommendedResourceDatasetDefaultFilters} from '../automate_v2/filters'

export const customerSatisfactionPerIntentLevelQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    customFieldId?: number,
    customFieldValue?: string,
    assigneeUserId?: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const customFiledFilters = []
    if (customFieldId) {
        customFiledFilters.push({
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(customFieldId)],
        })
    }
    if (customFieldValue) {
        customFiledFilters.push({
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: [customFieldValue],
        })
    }

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
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
            TicketSatisfactionSurveyDimension.SurveyScore,
        ],
        timezone,
        segments: [TicketSatisfactionSurveySegment.SurveyScored],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statsFilters
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
    sorting?: OrderDirection
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
