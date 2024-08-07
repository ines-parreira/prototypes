import {AutomationDatasetFilterMember} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetFilterMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {
    addOptionalFilter,
    hasFilter,
    isFilterWithLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters, WithLogicalOperator} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'

export const automationDatasetDefaultFilters = (
    filters: StatsFilters
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
    filters: StatsFilters
): ReportingFilter[] =>
    addOptionalFilter([], filters.channels, {
        member: AutomationDatasetFilterMember.Channel,
        operator: ReportingFilterOperator.Equals,
    })

export const billableTicketDatasetDefaultFilters = (
    filters: StatsFilters
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

export const billableTicketDatasetAdditionalFilters = (
    filters: StatsFilters
): ReportingFilter[] => [
    ...(hasFilter(filters.channels)
        ? [
              {
                  member: BillableTicketDatasetFilterMember.Channel,
                  operator: ReportingFilterOperator.Equals,
                  values: mapTicketChannelsToAutomateChannels(filters.channels),
              },
          ]
        : []),
]

const ticketChannelToAutomateChannel = (channel: string) =>
    channel === 'contact_form' ? 'contact-form' : channel

export const mapTicketChannelsToAutomateChannels = (
    channels: string[] | WithLogicalOperator<string> | undefined
): string[] => {
    if (channels === undefined) {
        return []
    }
    if (isFilterWithLogicalOperator(channels)) {
        return channels.values.map(ticketChannelToAutomateChannel)
    }
    return channels.map(ticketChannelToAutomateChannel)
}
