import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST } from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

export const workloadPerChannelDistributionQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST,
        ),
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
                filters,
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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_WORKLOAD_PER_CHANNEL,
    }
}
