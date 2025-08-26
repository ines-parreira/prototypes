import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    ticketCountForProductDrillDownQueryFactory,
    ticketCountPerProductQueryFactory,
    ticketsWithProductsQueryFactory,
} from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('ticketsWithProducts', () => {
    const periodStart = '2025-06-02T12:00:00.000'
    const periodEnd = '2025-06-09T12:00:00.000'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('ticketsWithProductsQueryFactory', () => {
        it('should make ticketsWithProductsCount query', () => {
            const actual = ticketsWithProductsQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_TICKETS_WITH_PRODUCTS,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [],
                timezone,
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
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
                ],
                order: [[TicketProductsEnrichedMeasure.TicketCount, 'asc']],
            }

            expect(actual).toEqual(expected)
        })

        it('should make ticketsWithProductsCount query without sorting', () => {
            const actual = ticketsWithProductsQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_TICKETS_WITH_PRODUCTS,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [],
                timezone,
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
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
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketCountPerProductQueryFactory', () => {
        it('should make ticketCountPerProduct query', () => {
            const actual = ticketCountPerProductQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_TICKETS_WITH_PRODUCTS,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [
                    TicketProductsEnrichedDimension.ProductId,
                    TicketProductsEnrichedDimension.StoreId,
                ],
                timezone,
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
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
                ],
                order: [[TicketProductsEnrichedMeasure.TicketCount, 'asc']],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketCountForProductDrillDownQueryFactory', () => {
        const productId = '123'

        it('should make ticketCountForProductDrillDownQueryFactory query', () => {
            const actual = ticketCountForProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                productId,
            )

            const expected = {
                metricName:
                    METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_PRODUCT_DRILL_DOWN,
                measures: [TicketProductsEnrichedMeasure.TicketCount],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                ],
                timezone,
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
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
                        member: TicketProductsEnrichedDimension.ProductId,
                        operator: ReportingFilterOperator.Equals,
                        values: [productId],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })
})
