import { AutomationDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { RecommendedResourcesFilterMember } from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMember } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    AI_INTENT_TO_EXCLUDE,
    AI_OUTCOME_TO_EXCLUDE,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import {
    addFieldIdToCustomFieldValues,
    addOptionalFilter,
    isFilterWithLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    WithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'domains/reporting/models/types'
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
    addOptionalFilter(
        [],
        mapTicketChannelsToAutomateChannelsInFilter(filters.channels),
        {
            member: AutomationDatasetFilterMember.Channel,
            operator: ReportingFilterOperator.Equals,
        },
    )

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
            operator: ReportingFilterOperator.NotStartsWith,
            values: [`${intentFieldId}::${AI_INTENT_TO_EXCLUDE}`],
        },
        ...(allOutcomeValuesToExclude && allOutcomeValuesToExclude.length > 0
            ? [
                  {
                      member: TicketMember.CustomField,
                      operator: ReportingFilterOperator.NotStartsWith,
                      values: allOutcomeValuesToExclude,
                  },
              ]
            : []),
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
            operator: ReportingFilterOperator.NotStartsWith,
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
                      member: TicketMember.CustomField,
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
            operator: ReportingFilterOperator.NotStartsWith,
            values: [AI_INTENT_TO_EXCLUDE],
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

export const billableTicketDatasetAdditionalFilters = (
    filters: StatsFilters,
): ReportingFilter[] =>
    addOptionalFilter(
        [],
        mapTicketChannelsToAutomateChannelsInFilter(filters.channels),
        {
            member: BillableTicketDatasetFilterMember.Channel,
            operator: ReportingFilterOperator.Equals,
        },
    )

const ticketChannelToAutomateChannel = (channel: string) =>
    channel === 'contact_form' ? 'contact-form' : channel

export const mapTicketChannelsToAutomateChannels = (
    channels: string[] | undefined,
): string[] => {
    if (channels === undefined) {
        return []
    }

    return channels.map(ticketChannelToAutomateChannel)
}

export const mapTicketChannelsToAutomateChannelsInFilter = (
    channels: string[] | WithLogicalOperator<string> | undefined,
): string[] | WithLogicalOperator<string> => {
    if (channels === undefined) {
        return []
    }
    if (isFilterWithLogicalOperator(channels)) {
        return {
            ...channels,
            values: channels.values.map(ticketChannelToAutomateChannel),
        }
    }

    return channels.map(ticketChannelToAutomateChannel)
}

export const recommendedResourceDatasetDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: RecommendedResourcesFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: RecommendedResourcesFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]
