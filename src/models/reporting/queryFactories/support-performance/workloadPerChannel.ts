import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const workloadPerChannelDistributionQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    order: [[TicketMeasure.TicketCount, OrderDirection.Desc]],
    dimensions: [TicketDimension.Channel],
    segments: [TicketSegment.WorkloadTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
})
