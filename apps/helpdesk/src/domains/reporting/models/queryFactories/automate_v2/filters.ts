import { AIAgentInteractionsBySkillFilterMember } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AutomationDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMember } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    AI_INTENTS_TO_EXCLUDE,
    AI_OUTCOME_TO_EXCLUDE,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import {
    addFieldIdToCustomFieldValues,
    addOptionalFilter,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingFilter } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

export const automationDatasetDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: AutomationDatasetFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: AutomationDatasetFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]

export const automationDatasetAdditionalFilters = (
    filters: StatsFilters,
): ReportingFilter[] =>
    addOptionalFilter([], filters.channels, {
        member: AutomationDatasetFilterMember.Channel,
        operator: ReportingFilterOperator.Equals,
    })

export const billableTicketDatasetDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: BillableTicketDatasetFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: BillableTicketDatasetFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]

export const aiAgentTicketsDefaultFilters = ({
    filters,
    outcomeFieldId,
    intentFieldId,
    outcomeValuesToExclude,
    integrationIds,
    ignoreOutcomeFieldId,
}: {
    filters: StatsFilters
    outcomeFieldId?: number
    intentFieldId?: number
    outcomeValuesToExclude?: string[]
    integrationIds?: string[]
    ignoreOutcomeFieldId?: boolean
}) => {
    const allOutcomeValuesToExclude = ignoreOutcomeFieldId
        ? []
        : [`${outcomeFieldId}::${AI_OUTCOME_TO_EXCLUDE}`]

    if (outcomeValuesToExclude && outcomeValuesToExclude.length > 0) {
        allOutcomeValuesToExclude.push(...outcomeValuesToExclude)
    }

    const allIntentValuesToExclude = AI_INTENTS_TO_EXCLUDE.map(
        (value) => `${intentFieldId}::${value}`,
    )

    return [
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
            values: [...allIntentValuesToExclude, ...allOutcomeValuesToExclude],
        },
        ...(integrationIds && integrationIds.length > 0
            ? [
                  {
                      member: TicketMessagesMember.IntegrationChannelPair,
                      operator: ReportingFilterOperator.Equals,
                      values: integrationIds,
                  },
              ]
            : [
                  {
                      member: TicketMessagesMember.IntegrationChannelPair,
                      operator: ReportingFilterOperator.Equals,
                      values: ['0'],
                  },
              ]),
    ]
}

export const aiAgentTicketsFromTicketCustomFieldsDefaultFilters = ({
    filters,
    outcomeFieldId,
    integrationIds,
    outcomeValuesToExclude,
    outcomeValueToInclude,
}: {
    filters: StatsFilters
    outcomeFieldId?: number
    integrationIds?: string[]
    outcomeValuesToExclude?: string[]
    outcomeValueToInclude?: string
}) => {
    const outcomeValuesToInclude = outcomeValueToInclude
        ? [`${outcomeFieldId}::${outcomeValueToInclude}`]
        : [`${outcomeFieldId}::`]

    return [
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
            values: [`${outcomeFieldId}::${AI_OUTCOME_TO_EXCLUDE}`],
        },
        {
            member: TicketMember.CustomField,
            operator: ReportingFilterOperator.StartsWith,
            values: outcomeValuesToInclude,
        },
        ...(outcomeValuesToExclude && outcomeValuesToExclude.length > 0
            ? [
                  {
                      member: TicketMember.CustomFieldToExclude,
                      operator: ReportingFilterOperator.NotStartsWith,
                      values: addFieldIdToCustomFieldValues(
                          outcomeFieldId || -1,
                          outcomeValuesToExclude,
                      ),
                  },
              ]
            : []),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.NotEquals,
            values: AI_INTENTS_TO_EXCLUDE,
        },
        ...(integrationIds && integrationIds.length > 0
            ? [
                  {
                      member: TicketMessagesMember.IntegrationChannelPair,
                      operator: ReportingFilterOperator.Equals,
                      values: integrationIds,
                  },
              ]
            : [
                  {
                      member: TicketMessagesMember.IntegrationChannelPair,
                      operator: ReportingFilterOperator.Equals,
                      values: ['0'],
                  },
              ]),
    ]
}

export const aiAgentInteractionsBySkillDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: AIAgentInteractionsBySkillFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: AIAgentInteractionsBySkillFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]
