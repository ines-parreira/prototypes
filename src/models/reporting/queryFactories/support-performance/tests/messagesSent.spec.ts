import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    messagesSentMetricPerAgentQueryFactory,
    messagesSentMetricPerTicketQueryFactory,
    messagesSentQueryFactory,
    messagesSentTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    getFilterDateRange,
    PublicHelpdeskAndApiMessagesFilter,
} from 'utils/reporting'

describe('messagesSentQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesSentQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...PublicHelpdeskAndApiMessagesFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone,
        })
    })
})

describe('messagesSentTimeSeriesQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const granularity = ReportingGranularity.Day
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesSentTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity
        )

        expect(query).toEqual({
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...PublicHelpdeskAndApiMessagesFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timeDimensions: [
                {
                    dimension: HelpdeskMessageDimension.SentDatetime,
                    granularity,
                    dateRange: getFilterDateRange(statsFilters),
                },
            ],
            timezone,
        })
    })
})

describe('messagesSentMetricPerAgentQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
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
            messagesSentMetricPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            dimensions: [HelpdeskMessageDimension.SenderId],
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}
        expect(
            messagesSentMetricPerAgentQueryFactory(filters, timezone, sorting)
        ).toEqual({
            ...messagesSentQueryFactory(filters, timezone),
            dimensions: [HelpdeskMessageDimension.SenderId],
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})

describe('messagesSentMetricPerTicketQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
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
            messagesSentMetricPerTicketQueryFactory(statsFilters, timezone)
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            dimensions: [TicketDimension.TicketId],
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            messagesSentMetricPerTicketQueryFactory(filters, timezone, sorting)
        ).toEqual({
            ...messagesSentQueryFactory(filters, timezone),
            dimensions: [TicketDimension.TicketId],
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})
