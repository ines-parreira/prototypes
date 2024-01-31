import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {subtractDaysFromDate} from 'utils/date'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const workloadPerChannelDistributionQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST
        )
    )
    return {
        measures: [TicketMeasure.TicketCount],
        order: [[TicketMeasure.TicketCount, OrderDirection.Desc]],
        dimensions: [TicketDimension.Channel],
        segments: [TicketSegment.WorkloadTickets],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ).map((filter) => {
                if (filter.member === TicketStatsFiltersMembers.periodStart)
                    return {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [hardPeriodStart],
                    }
                return filter
            }),
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
        timezone,
    }
}
