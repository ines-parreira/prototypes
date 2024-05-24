import {AutomationDatasetFilterMember} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetFilterMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
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
): ReportingFilter[] => [
    ...(filters.channels && filters.channels.length
        ? [
              {
                  member: AutomationDatasetFilterMember.Channel,
                  operator: ReportingFilterOperator.Equals,
                  values: mapTicketChannelsToAutomateChannels(filters.channels),
              },
          ]
        : []),
]

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
    ...(filters.channels && filters.channels.length
        ? [
              {
                  member: BillableTicketDatasetFilterMember.Channel,
                  operator: ReportingFilterOperator.Equals,
                  values: filters.channels,
              },
          ]
        : []),
]

const mapTicketChannelsToAutomateChannels = (channels: string[]): string[] => {
    return channels.map((channel) =>
        channel === 'contact_form' ? 'contact-form' : channel
    )
}
