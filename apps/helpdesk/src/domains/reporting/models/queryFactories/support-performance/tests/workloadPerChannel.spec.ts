import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { workloadPerChannelDistributionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/workloadPerChannel'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

describe('workloadPerChannelDistributionQueryFactory', () => {
    const now = moment()
    const periodStart = formatReportingQueryDate(now)
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(formatReportingQueryDate(now), 180),
    )
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should build a query', () => {
        const query = workloadPerChannelDistributionQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_WORKLOAD_PER_CHANNEL,
            measures: [TicketMeasure.TicketCount],
            dimensions: [TicketDimension.Channel],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
            ],
            order: [[TicketMeasure.TicketCount, OrderDirection.Desc]],
            segments: [TicketSegment.WorkloadTickets],
            timezone,
        })
    })
})
