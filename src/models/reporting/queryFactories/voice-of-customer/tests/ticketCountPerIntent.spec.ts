import { OrderDirection } from 'models/api/types'
import {
    ticketCountPerIntentDrillDownQueryFactory,
    ticketCountPerIntentForProductDrillDownQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
    ticketCountPerIntentQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'models/stat/types'

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
                member: 'TicketProductsEnriched.deleted_datetime',
                operator: 'equals',
                values: [null],
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
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
            order: [['TicketProductsEnriched.ticketCount', 'desc']],
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
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: [
            'TicketProductsEnriched.productId',
            'TicketCustomFieldsEnriched.valueString',
        ],
        timezone,
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
                member: 'TicketProductsEnriched.deleted_datetime',
                operator: 'equals',
                values: [null],
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
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
                member: 'TicketProductsEnriched.deleted_datetime',
                operator: 'equals',
                values: [null],
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
                values: [intentCustomFieldId],
            },
            {
                member: 'TicketProductsEnriched.productId',
                operator: 'equals',
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
            order: [['TicketProductsEnriched.ticketCount', 'desc']],
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

    const query = {
        measures: ['TicketProductsEnriched.ticketCount'],
        dimensions: ['TicketEnriched.ticketId'],
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
                member: 'TicketProductsEnriched.deleted_datetime',
                operator: 'equals',
                values: [null],
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
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
                values: [intentCustomFieldId],
            },
            {
                member: 'TicketProductsEnriched.productId',
                operator: 'equals',
                values: [productId],
            },
            {
                member: ['TicketCustomFieldsEnriched.valueString'],
                operator: 'equals',
                values: [intentCustomFieldValueString],
            },
        ],
        limit: 100,
    }

    it('creates ticketCountPerIntentForProductDrillDown query', () => {
        const actual = ticketCountPerIntentForProductDrillDownQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            intentCustomFieldValueString,
            productId,
        )

        expect(actual).toEqual(query)
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
            ...query,
            order: [['TicketEnriched.createdDatetime', 'desc']],
        }

        expect(actual).toEqual(expected)
    })
})
