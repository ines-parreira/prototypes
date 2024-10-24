import moment from 'moment'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMember,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    oneTouchTicketsPerAgentQueryFactory,
    oneTouchTicketsPerTicketQueryFactory,
    oneTouchTicketsQueryFactory,
} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ReportingFilterOperator} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {subtractDaysFromDate} from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('oneTouchTicketsPerAgentQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            oneTouchTicketsPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
            dimensions: [TicketDimension.AssigneeUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                {
                    member: TicketMessagesMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels,
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
                {
                    member: TicketDimension.CreatedDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            subtractDaysFromDate(
                                statsFilters.period.start_datetime,
                                180
                            )
                        ),
                    ],
                },
                {
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            subtractDaysFromDate(
                                statsFilters.period.start_datetime,
                                180
                            )
                        ),
                    ],
                },
            ],
            measures: [TicketMeasure.TicketCount],
            segments: [
                TicketMessagesDimension.OneTouchTickets,
                TicketSegment.ClosedTickets,
            ],
            timeDimensions: [],
            timezone: timezone,
        })
    })

    it('should build a query with sorting', () => {
        const agents = [2]

        expect(
            oneTouchTicketsPerAgentQueryFactory(
                {...statsFilters, agents},
                timezone,
                sorting
            )
        ).toEqual({
            dimensions: [TicketDimension.AssigneeUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                {
                    member: TicketMessagesMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels,
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents?.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
                {
                    member: TicketDimension.CreatedDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            subtractDaysFromDate(
                                statsFilters.period.start_datetime,
                                180
                            )
                        ),
                    ],
                },
                {
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            subtractDaysFromDate(
                                statsFilters.period.start_datetime,
                                180
                            )
                        ),
                    ],
                },
            ],
            measures: [TicketMeasure.TicketCount],
            order: [[TicketMeasure.TicketCount, sorting]],
            segments: [
                TicketMessagesDimension.OneTouchTickets,
                TicketSegment.ClosedTickets,
            ],
            timeDimensions: [],
            timezone: timezone,
        })
    })
})

describe('oneTouchTicketsPerTicketQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            oneTouchTicketsPerTicketQueryFactory(statsFilters, timezone)
        ).toEqual({
            ...oneTouchTicketsQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...oneTouchTicketsQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            oneTouchTicketsPerTicketQueryFactory(filters, timezone, sorting)
        ).toEqual({
            ...oneTouchTicketsQueryFactory(filters, timezone, sorting),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...oneTouchTicketsQueryFactory(filters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})
