import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    ticketCountForProductDrillDownQueryFactory,
    ticketCountPerProductQueryFactory,
    ticketsWithProductsQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { DRILLDOWN_QUERY_LIMIT } from 'utils/reporting'

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
