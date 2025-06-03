import { OrderDirection } from 'models/api/types'
import {
    ticketCountPerProductQueryFactory,
    ticketsWithProductsDrillDownQueryFactory,
    ticketsWithProductsQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { StatsFilters } from 'models/stat/types'

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
                measures: ['TicketProductsEnriched.ticketCount'],
                dimensions: [],
                timezone: 'someTimeZone',
                segments: [],
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: [periodStart],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: [periodEnd],
                    },
                ],
                order: [['TicketProductsEnriched.ticketCount', 'asc']],
            }

            expect(actual).toEqual(expected)
        })

        it('should make ticketsWithProductsCount query without sorting', () => {
            const actual = ticketsWithProductsQueryFactory(
                statsFilters,
                timezone,
            )

            const expected = {
                measures: ['TicketProductsEnriched.ticketCount'],
                dimensions: [],
                timezone: 'someTimeZone',
                segments: [],
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: [periodStart],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
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
                measures: ['TicketProductsEnriched.ticketCount'],
                dimensions: ['TicketProductsEnriched.productId'],
                timezone: 'someTimeZone',
                segments: [],
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: [periodStart],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: [periodEnd],
                    },
                ],
                order: [['TicketProductsEnriched.ticketCount', 'asc']],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketsWithProductsDrillDownQueryFactory', () => {
        it('should make ticketsWithProductsDrillDown Query', () => {
            const actual = ticketsWithProductsDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            const expected = {
                measures: ['TicketProductsEnriched.ticketCount'],
                dimensions: [
                    'TicketEnriched.ticketId',
                    'TicketEnriched.createdDatetime',
                ],
                timezone: 'someTimeZone',
                segments: [],
                filters: [
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: [periodStart],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: [periodEnd],
                    },
                ],
                order: [['TicketEnriched.createdDatetime', 'asc']],
                limit: 100,
            }

            expect(actual).toEqual(expected)
        })
    })
})
