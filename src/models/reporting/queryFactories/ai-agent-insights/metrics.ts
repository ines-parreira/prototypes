import {CustomField} from 'custom-fields/types'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
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

export const customerSatisfactionPerCustomFieldQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    customField?: CustomField,
    customFieldValue?: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const customFiledFilters = []
    if (customField) {
        customFiledFilters.push({
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(customField.id)],
        })
    }

    if (customFieldValue) {
        customFiledFilters.push({
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: [customFieldValue],
        })
    }

    return {
        measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
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
