import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { TicketCustomFieldsCubeWithJoins } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'

export const handoverInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCubeWithJoins> => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    filters: [
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(outcomeCustomFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: ['Handover::'],
        },
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_INTENT,
})

export const snoozedInteractionsPerIntentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
): ReportingQuery<TicketCustomFieldsCubeWithJoins> => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    filters: [
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(outcomeCustomFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: ['Snooze::'],
        },
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_AGENT_SNOOZED_INTERACTIONS_PER_INTENT,
})
