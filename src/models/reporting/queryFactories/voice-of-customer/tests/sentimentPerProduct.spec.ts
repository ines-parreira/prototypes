import { Sentiment } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { OrderDirection } from 'models/api/types'
import {
    sentimentsTicketCountPerProductDrillDownQueryFactory,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { StatsFilters } from 'models/stat/types'

describe('sentimentsTicketCountPerProduct', () => {
    const timezone = 'someTimeZone'

    const periodStart = '2025-05-23T00:00:00.000'
    const periodEnd = '2025-05-30T00:00:00.000'

    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    const customFieldId = '123'
    const productId = '456'
    const sorting = OrderDirection.Asc

    describe('sentimentsTicketCountPerProductQueryFactory', () => {
        it('creates query', () => {
            const actual = sentimentsTicketCountPerProductQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
            )

            const expected = {
                measures: [TICKET_COUNT_MEASURE],
                dimensions: [
                    'TicketProductsEnriched.productId',
                    'TicketCustomFieldsEnriched.valueString',
                ],
                timezone,
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
                    {
                        member: 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
                        operator: 'inDateRange',
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: 'TicketCustomFieldsEnriched.customFieldId',
                        operator: 'equals',
                        values: [customFieldId],
                    },
                    {
                        member: 'TicketProductsEnriched.deleted_datetime',
                        operator: 'equals',
                        values: [null],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with product filter if given', () => {
            const actual = sentimentsTicketCountPerProductQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                productId,
            )

            expect(actual.filters).toEqual(
                expect.arrayContaining([
                    {
                        member: 'TicketProductsEnriched.productId',
                        operator: 'equals',
                        values: [productId],
                    },
                ]),
            )
        })

        it('creates query with order if given', () => {
            const actual = sentimentsTicketCountPerProductQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                productId,
                sorting,
            )

            expect(actual.order).toBeDefined()
        })
    })

    describe('sentimentsTicketCountPerProductDrillDownQueryFactory', () => {
        it('creates drill-down query', () => {
            const actual = sentimentsTicketCountPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                Sentiment.Negative,
                productId,
            )

            const expected = {
                measures: [TICKET_COUNT_MEASURE],
                dimensions: ['TicketEnriched.ticketId'],
                timezone,
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
                    {
                        member: 'TicketEnriched.customField',
                        values: ['123::Negative'],
                        operator: 'equals',
                    },
                    {
                        member: 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
                        operator: 'inDateRange',
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: 'TicketCustomFieldsEnriched.customFieldId',
                        operator: 'equals',
                        values: [customFieldId],
                    },
                    {
                        member: 'TicketProductsEnriched.deleted_datetime',
                        operator: 'equals',
                        values: [null],
                    },
                    {
                        member: 'TicketProductsEnriched.productId',
                        operator: 'equals',
                        values: [productId],
                    },
                ],
                order: [['TicketEnriched.createdDatetime', 'desc']],
                limit: 100,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting when provided', () => {
            const actual = sentimentsTicketCountPerProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                Sentiment.Negative,
                productId,
                sorting,
            )

            expect(actual.order?.[0]?.[1]).toBe(sorting)
        })
    })
})
