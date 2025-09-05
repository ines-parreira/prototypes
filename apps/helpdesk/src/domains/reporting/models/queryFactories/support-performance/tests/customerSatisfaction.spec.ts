import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    customerSatisfactionMetricDrillDownQueryFactory,
    customerSatisfactionMetricPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('CustomerSatisfaction', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('customerSatisfactionMetricPerAgentQueryFactory', () => {
        it('should build a query', () => {
            expect(
                customerSatisfactionMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_AGENT,
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
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
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_AGENT,
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values,
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
                segments: [TicketSatisfactionSurveySegment.SurveyScored],
                order: [
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
                ],
                timezone: timezone,
            })
        })
    })

    describe('customerSatisfactionMetricDrillDownQueryFactory', () => {
        it('should build a query', () => {
            expect(
                customerSatisfactionMetricDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_TICKET_DRILL_DOWN,
                dimensions: [
                    TicketDimension.TicketId,
                    TicketSatisfactionSurveyDimension.SurveyScore,
                    ...customerSatisfactionMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                    ).dimensions,
                ],
                filters: [
                    ...customerSatisfactionMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
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
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...customerSatisfactionMetricPerAgentQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CUSTOMER_SATISFACTION_PER_TICKET_DRILL_DOWN,
                dimensions: [
                    TicketDimension.TicketId,
                    TicketSatisfactionSurveyDimension.SurveyScore,
                    ...customerSatisfactionMetricPerAgentQueryFactory(
                        {
                            ...statsFilters,
                            agents: withDefaultLogicalOperator(agents),
                        },
                        timezone,
                        sorting,
                    ).dimensions,
                ],
                filters: [
                    ...customerSatisfactionMetricPerAgentQueryFactory(
                        {
                            ...statsFilters,
                            agents: withDefaultLogicalOperator(agents),
                        },
                        timezone,
                        sorting,
                    ).filters,
                    TicketDrillDownFilter,
                ],
                measures: [],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [
                    [TicketSatisfactionSurveyDimension.SurveyScore, sorting],
                ],
            })
        })
    })
})
