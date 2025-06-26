import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMember,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    sentimentsTicketCountPerProductDrillDownQueryFactory,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { ReportingFilterOperator } from 'models/reporting/types'
import { Sentiment, StatsFilters } from 'models/stat/types'

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

    const customFieldId = 123
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
                    TicketProductsEnrichedDimension.ProductId,
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                timezone,
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
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(customFieldId)],
                    },
                    {
                        member: TicketProductsEnrichedMember.DeletedDatetime,
                        operator: ReportingFilterOperator.Equals,
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
                        member: TicketProductsEnrichedMember.ProductId,
                        operator: ReportingFilterOperator.Equals,
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
                dimensions: [TicketDimension.TicketId],
                timezone,
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
                        member: TicketMember.CustomField,
                        values: ['123::Negative'],
                        operator: ReportingFilterOperator.Equals,
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(customFieldId)],
                    },
                    {
                        member: TicketProductsEnrichedMember.DeletedDatetime,
                        operator: ReportingFilterOperator.Equals,
                        values: [null],
                    },
                    {
                        member: TicketProductsEnrichedMember.ProductId,
                        operator: ReportingFilterOperator.Equals,
                        values: [productId],
                    },
                ],
                order: [[TicketMember.CreatedDatetime, OrderDirection.Desc]],
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
