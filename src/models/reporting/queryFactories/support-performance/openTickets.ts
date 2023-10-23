import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure, TicketMember} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const openTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMember.Status,
            operator: ReportingFilterOperator.Equals,
            values: ['open'],
        },
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            filters
        ).filter(
            (filter) => filter.member !== TicketStatsFiltersMembers.periodStart
        ),
    ],
})
