import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'

import { AI_INTENTS_TO_EXCLUDE, AI_OUTCOME_TO_EXCLUDE } from './utils'

export const supportInteractionsTotalQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeCustomFieldId}::`],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: AI_INTENTS_TO_EXCLUDE,
            },
        ],
        timezone,
        metricName: METRIC_NAMES.AI_AGENT_SUPPORT_INTERACTIONS_TOTAL,
    }
}

export const supportInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [
            TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue,
        ],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeCustomFieldId}::${AI_OUTCOME_TO_EXCLUDE}`],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeCustomFieldId}::`],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: AI_INTENTS_TO_EXCLUDE,
            },
        ],
        timezone,
        metricName: METRIC_NAMES.AI_AGENT_TOTAL_INTERACTIONS_PER_INTENT,
    }
}
