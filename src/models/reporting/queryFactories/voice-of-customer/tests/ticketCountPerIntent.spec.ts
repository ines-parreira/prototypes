import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
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
    productsTicketCountPerIntentQueryFactory,
    ticketCountPerIntentDrillDownQueryFactory,
    ticketCountPerIntentForProductDrillDownQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
    ticketCountPerIntentForProductsDrillDownQueryFactory,
    ticketCountPerIntentQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { DRILLDOWN_QUERY_LIMIT } from 'utils/reporting'

describe('ticketCountPerIntentQueryFactory', () => {
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
    const sorting = OrderDirection.Desc

    const query = {
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: [
            'TicketProductsEnriched.productId',
            'TicketCustomFieldsEnriched.valueString',
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
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
        ],
    }

    it('should produce the query', () => {
        const actual = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
        )

        expect(actual).toEqual(query)
    })

    it('should produce the query with sorting', () => {
        const actual = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        )

        const expected = {
            ...query,
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

describe('ticketCountPerIntentDrillDownQueryFactory', () => {
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
    const sorting = OrderDirection.Desc

    const query = {
        measures: [TicketProductsEnrichedMeasure.TicketCount],
        dimensions: [
            TicketProductsEnrichedDimension.ProductId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
        ],
        limit: 100,
    }

    it('should produce the query', () => {
        const actual = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
        )

        expect(actual).toEqual(query)
    })

    it('should produce the query with sorting', () => {
        const actual = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        )

        const expected = {
            ...query,
            order: [['TicketProductsEnriched.ticketCount', 'desc']],
        }

        expect(actual).toEqual(expected)
    })
})

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
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: [
            TicketProductsEnrichedDimension.ProductId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: ReportingFilterOperator.Equals,
                values: [String(intentCustomFieldId)],
            },
            {
                member: 'TicketProductsEnriched.productId',
                operator: ReportingFilterOperator.Equals,
                values: [productId],
            },
        ],
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

describe('ticketCountPerIntentForProductDrillDownQueryFactory', () => {
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
        const actual = ticketCountPerIntentForProductDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentCustomFieldValueString,
            productId,
        )

        expect(actual).toEqual({
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
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [String(intentCustomFieldId)],
                },
                {
                    member: TicketProductsEnrichedMember.ProductId,
                    operator: ReportingFilterOperator.Equals,
                    values: [productId],
                },
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.Equals,
                    values: [intentCustomFieldValueString],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('creates query with ordering if provided', () => {
        const actual = ticketCountPerIntentForProductDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentCustomFieldValueString,
            productId,
            sorting,
        )

        const expected = {
            ...ticketCountPerIntentForProductDrillDownQueryFactory(
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

describe('productsTicketCountPerIntentQueryFactory', () => {
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
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [intentCustomFieldId.toString()],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.Equals,
                values: [intentsCustomFieldValueString],
            },
        ],
    }

    it('creates query with specific intent value filter', () => {
        const actual = productsTicketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
        )

        expect(actual).toEqual(baseQuery)
    })

    it('creates query with sorting when provided', () => {
        const actual = productsTicketCountPerIntentQueryFactory(
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

describe('ticketCountPerIntentForProductsDrillDownQueryFactory', () => {
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
        const actual = ticketCountPerIntentForProductsDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
        )

        expect(actual).toEqual({
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
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [String(intentCustomFieldId)],
                },
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.Equals,
                    values: [intentsCustomFieldValueString],
                },
                {
                    member: TicketProductsEnrichedDimension.ProductId,
                    operator: ReportingFilterOperator.NotEquals,
                    values: ['null', 'undefined'],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })
})
