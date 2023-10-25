import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesDimension} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const oneTouchTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        {
            member: TicketMember.Status,
            operator: ReportingFilterOperator.Equals,
            values: ['closed'],
        },
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    segments: [TicketMessagesDimension.OneTouchTickets],
    timeDimensions: [],
    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const oneTouchTicketsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...oneTouchTicketsQueryFactory(filters, timezone, sorting),
    dimensions: [TicketDimension.AssigneeUserId],
})
