import {AutomationDatasetFilterMember} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetFilterMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {RecommendedResourcesFilterMember} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import {
    addOptionalFilter,
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
    addOptionalFilter(
        [],
        mapTicketChannelsToAutomateChannelsInFilter(filters.channels),
        {
            member: AutomationDatasetFilterMember.Channel,
            operator: ReportingFilterOperator.Equals,
        }
    )

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
): ReportingFilter[] =>
    addOptionalFilter(
        [],
        mapTicketChannelsToAutomateChannelsInFilter(filters.channels),
        {
            member: BillableTicketDatasetFilterMember.Channel,
            operator: ReportingFilterOperator.Equals,
        }
    )

const ticketChannelToAutomateChannel = (channel: string) =>
    channel === 'contact_form' ? 'contact-form' : channel

export const mapTicketChannelsToAutomateChannels = (
    channels: string[] | undefined
): string[] => {
    if (channels === undefined) {
        return []
    }

    return channels.map(ticketChannelToAutomateChannel)
}

export const mapTicketChannelsToAutomateChannelsInFilter = (
    channels: string[] | WithLogicalOperator<string> | undefined
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
    filters: StatsFilters
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
