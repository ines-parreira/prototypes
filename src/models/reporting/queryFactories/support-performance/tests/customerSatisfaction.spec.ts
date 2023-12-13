import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    customerSatisfactionMetricDrillDownQueryFactory,
    customerSatisfactionMetricPerAgentQueryFactory,
} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('customerSatisfactionMetricPerAgentQueryFactory', () => {
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
            customerSatisfactionMetricPerAgentQueryFactory(
                statsFilters,
                timezone
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
                    values: [formatReportingQueryDate(periodStart)],
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
            ],
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            timezone: timezone,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            customerSatisfactionMetricPerAgentQueryFactory(
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
                    values: [formatReportingQueryDate(periodStart)],
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
                    values: agents.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
            ],
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            order: [[TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting]],
            timezone: timezone,
        })
    })
})

describe('customerSatisfactionMetricDrillDownQueryFactory', () => {
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
            customerSatisfactionMetricDrillDownQueryFactory(
                statsFilters,
                timezone
            )
        ).toEqual({
            ...customerSatisfactionMetricPerAgentQueryFactory(
                statsFilters,
                timezone
            ),
            dimensions: [
                TicketDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                ).dimensions,
            ],
            filters: [
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                ).filters,
                TicketDrillDownFilter,
            ],
            measures: [],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            customerSatisfactionMetricDrillDownQueryFactory(
                {...statsFilters, agents},
                timezone,
                sorting
            )
        ).toEqual({
            ...customerSatisfactionMetricPerAgentQueryFactory(
                {...statsFilters, agents},
                timezone,
                sorting
            ),
            dimensions: [
                TicketDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    {...statsFilters, agents},
                    timezone,
                    sorting
                ).dimensions,
            ],
            filters: [
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    {...statsFilters, agents},
                    timezone,
                    sorting
                ).filters,
                TicketDrillDownFilter,
            ],
            measures: [],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketSatisfactionSurveyDimension.SurveyScore, sorting]],
        })
    })
})
