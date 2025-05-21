import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import { TicketMessagesMember } from 'models/reporting/cubes/TicketMessagesCube'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    ticketCountPerProductQueryFactory,
    ticketsWithProductsDrillDownQueryFactory,
    ticketsWithProductsQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'utils/reporting'

describe('ticketsWithProducts', () => {
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

    describe('ticketsWithProductsQueryFactory', () => {
        it('should make ticketsWithProductsCount query', () => {
            expect(
                ticketsWithProductsQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                dimensions: [],
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
                segments: [],
                timezone: timezone,
            })
        })

        it('should make ticketsWithProductsCount query without sorting', () => {
            expect(
                ticketsWithProductsQueryFactory(statsFilters, timezone),
            ).toEqual({
                dimensions: [],
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                segments: [],
                timezone: timezone,
            })
        })
    })

    describe('ticketCountPerProductQueryFactory', () => {
        it('should make ticketCountPerProduct query', () => {
            expect(
                ticketCountPerProductQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
                segments: [],
                timezone: timezone,
                dimensions: [TicketProductsEnrichedDimension.ProductId],
            })
        })
    })

    describe('ticketsWithProductsDrillDownQueryFactory', () => {
        it('should make ticketsWithProductsDrillDown Query', () => {
            expect(
                ticketsWithProductsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
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
                        values: statsFilters.integrations?.values.map(String),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                order: [[TicketDimension.CreatedDatetime, sorting]],
                segments: [],
                timezone: timezone,
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
            })
        })
    })
})
