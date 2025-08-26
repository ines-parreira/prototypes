import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
    TicketProductsEnrichedMember,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { getCustomFieldValueSerializer } from 'domains/reporting/models/queryFactories/utils'
import {
    ticketCountForIntentAndProductDrillDownQueryFactory,
    ticketCountForIntentDrillDownQueryFactory,
    ticketCountForIntentQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
} from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('ticketCountPerIntentForProductQueryFactory', () => {
    const periodStart = '2025-06-04T12:00:00.000'
    const periodEnd = '2025-06-11T12:00:00.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc
    const intentCustomFieldId = 123
    const productId = '456'

    const expectedQuery = {
        metricName:
            METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_PER_INTENT_FOR_PRODUCT,
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
        timezone,
        segments: [],
        filters: expect.arrayContaining([
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
                member: TicketProductsEnrichedMember.DeletedDatetime,
                operator: ReportingFilterOperator.Equals,
                values: [null],
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
            {
                member: 'TicketProductsEnriched.productId',
                operator: ReportingFilterOperator.Equals,
                values: [productId],
            },
        ]),
        order: undefined,
    }

    it('creates query', () => {
        const actual = ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            productId,
        )

        expect(actual).toEqual(expectedQuery)
    })

    it('creates query with ordering if given', () => {
        const actual = ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            productId,
            sorting,
        )

        const expected = {
            ...expectedQuery,
            order: [
                [
                    TicketProductsEnrichedMeasure.TicketCount,
                    OrderDirection.Desc,
                ],
            ],
        }

        expect(actual).toEqual(expected)
    })
})

describe('ticketCountForIntentAndProductDrillDownQueryFactory', () => {
    const periodStart = '2025-06-04T12:00:00.000'
    const periodEnd = '2025-06-11T12:00:00.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc
    const intentCustomFieldId = 123
    const intentCustomFieldValueString = 'Product::Return'
    const productId = '456'

    it('creates ticketCountPerIntentForProductDrillDown query', () => {
        const actual = ticketCountForIntentAndProductDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentCustomFieldValueString,
            productId,
        )

        expect(actual).toEqual({
            metricName:
                METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_PER_INTENT_AND_PRODUCT_DRILL_DOWN,
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [TicketDimension.TicketId],
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
                    member: TicketProductsEnrichedMember.DeletedDatetime,
                    operator: ReportingFilterOperator.Equals,
                    values: [null],
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
                    operator: ReportingFilterOperator.Equals,
                    values: [
                        getCustomFieldValueSerializer(intentCustomFieldId)(
                            intentCustomFieldValueString,
                        ),
                        ,
                    ],
                },
                {
                    member: TicketProductsEnrichedMember.ProductId,
                    operator: ReportingFilterOperator.Equals,
                    values: [productId],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: undefined,
        })
    })

    it('creates query with ordering if provided', () => {
        const actual = ticketCountForIntentAndProductDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentCustomFieldValueString,
            productId,
            sorting,
        )

        const expected = {
            ...ticketCountForIntentAndProductDrillDownQueryFactory(
                statsFilters,
                timezone,
                intentCustomFieldId,
                intentCustomFieldValueString,
                productId,
            ),
            order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
        }

        expect(actual).toEqual(expected)
    })
})

describe('ticketCountForIntentQueryFactory', () => {
    const periodStart = '2025-06-04T12:00:00.000'
    const periodEnd = '2025-06-11T12:00:00.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'someTimeZone'
    const intentCustomFieldId = 123
    const intentsCustomFieldValueString = 'Product::Return'
    const sorting = OrderDirection.Desc

    const baseQuery = {
        metricName: METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_INTENT,
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
                member: TicketProductsEnrichedMember.DeletedDatetime,
                operator: ReportingFilterOperator.Equals,
                values: [null],
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
                operator: ReportingFilterOperator.Equals,
                values: [
                    getCustomFieldValueSerializer(intentCustomFieldId)(
                        intentsCustomFieldValueString,
                    ),
                ],
            },
        ],
        order: undefined,
    }

    it('creates query with specific intent value filter', () => {
        const actual = ticketCountForIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
        )

        expect(actual).toEqual(baseQuery)
    })

    it('creates query with sorting when provided', () => {
        const actual = ticketCountForIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
            sorting,
        )

        const expected = {
            ...baseQuery,
            order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
        }

        expect(actual).toEqual(expected)
    })
})

describe('ticketCountForIntentDrillDownQueryFactory', () => {
    const periodStart = '2025-06-04T12:00:00.000'
    const periodEnd = '2025-06-11T12:00:00.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'someTimeZone'
    const intentCustomFieldId = 123
    const intentsCustomFieldValueString = 'Product::Return'

    it('creates drill down query for products with intent filtering', () => {
        const actual = ticketCountForIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
        )

        expect(actual).toEqual({
            metricName:
                METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_INTENT_DRILL_DOWN,
            measures: [TicketProductsEnrichedMeasure.TicketCount],
            dimensions: [TicketDimension.TicketId],
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
                    member: TicketProductsEnrichedMember.DeletedDatetime,
                    operator: ReportingFilterOperator.Equals,
                    values: [null],
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
                    operator: ReportingFilterOperator.Equals,
                    values: [
                        getCustomFieldValueSerializer(intentCustomFieldId)(
                            intentsCustomFieldValueString,
                        ),
                    ],
                },
                {
                    member: TicketProductsEnrichedDimension.ProductId,
                    operator: ReportingFilterOperator.NotEquals,
                    values: ['null', 'undefined'],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: undefined,
        })
    })
})
