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
    ticketCountPerIntentDrillDownQueryFactory,
    ticketCountPerIntentForProductDrillDownQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
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
    const intent = 'test-intent'
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
                values: [intent],
            },
        ],
    }

    it('should produce the query', () => {
        const actual = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intent,
        )

        expect(actual).toEqual(query)
    })

    it('should produce the query with sorting', () => {
        const actual = ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intent,
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
    const intent = 'test-intent'
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
                values: [intent],
            },
        ],
        limit: 100,
    }

    it('should produce the query', () => {
        const actual = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intent,
        )

        expect(actual).toEqual(query)
    })

    it('should produce the query with sorting', () => {
        const actual = ticketCountPerIntentDrillDownQueryFactory(
            statsFilters,
            timezone,
            intent,
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
    const intentCustomFieldId = '123'
    const productId = '456'

    const query = {
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: [
            'TicketProductsEnriched.productId',
            'TicketCustomFieldsEnriched.valueString',
        ],
        timezone: 'someTimeZone',
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
                member: 'TicketProductsEnriched.deleted_datetime',
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
                values: [intentCustomFieldId],
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

        expect(actual).toEqual(query)
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
    const intentCustomFieldId = '123'
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
            measures: ['TicketProductsEnriched.ticketCount'],
            dimensions: ['TicketEnriched.ticketId'],
            timezone: 'someTimeZone',
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
                    member: 'TicketProductsEnriched.deleted_datetime',
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
                    values: [intentCustomFieldId],
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
