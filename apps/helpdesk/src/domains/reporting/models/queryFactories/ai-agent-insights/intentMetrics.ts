import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    AI_INTENTS_TO_EXCLUDE,
    AI_OUTCOME_TO_EXCLUDE,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'

export const handoverInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
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
                values: [`${outcomeCustomFieldId}::Handover::`],
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
        metricName: METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_INTENT,
    }
}

export const snoozedInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
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
                values: [`${outcomeCustomFieldId}::Snooze::`],
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
        metricName: METRIC_NAMES.AI_AGENT_SNOOZED_INTERACTIONS_PER_INTENT,
    }
}

export const totalInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
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
