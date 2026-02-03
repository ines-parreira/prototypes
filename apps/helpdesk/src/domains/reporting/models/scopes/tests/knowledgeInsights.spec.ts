import {
    getCustomFilterIdFilters,
    knowledgeCSAT,
    knowledgeCSATDrillDown,
    knowledgeCSATDrillDownQueryV2Factory,
    knowledgeCSATQueryV2Factory,
    knowledgeHandoverTicketsCount,
    knowledgeHandoverTicketsCountQueryV2Factory,
    knowledgeHandoverTicketsDrillDown,
    knowledgeHandoverTicketsDrillDownQueryV2Factory,
    knowledgeIntents,
    knowledgeIntentsQueryV2Factory,
    knowledgeTicketsCount,
    knowledgeTicketsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/knowledgeInsights'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { OrderDirection } from 'models/api/types'

describe('knowledgeTicketsCount', () => {
    it('should build query without sorting', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeTicketsCount.build(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.dimensions).toEqual([
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.order).toBeUndefined()
    })

    it('should build query with sorting when sortDirection is provided', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            sortDirection: 'asc',
        }

        const query = knowledgeTicketsCount.build(ctx)

        expect(query.order).toEqual([
            ['resourceSourceSetId', OrderDirection.Asc],
            ['resourceSourceId', OrderDirection.Asc],
        ])
    })
})

describe('knowledgeTicketsCountQueryV2Factory', () => {
    it('should create a query from context', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeTicketsCountQueryV2Factory(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.timezone).toBe('America/New_York')
    })
})

describe('knowledgeHandoverTicketsCount', () => {
    it('should build query without sorting', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeHandoverTicketsCount.build(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.dimensions).toEqual([
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.order).toBeUndefined()
    })

    it('should build query with sorting when sortDirection is provided', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            sortDirection: 'desc',
        }

        const query = knowledgeHandoverTicketsCount.build(ctx)

        expect(query.order).toEqual([
            ['resourceSourceSetId', OrderDirection.Asc],
            ['resourceSourceId', OrderDirection.Asc],
        ])
    })
})

describe('knowledgeHandoverTicketsCountQueryV2Factory', () => {
    it('should create a query from context', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeHandoverTicketsCountQueryV2Factory(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.timezone).toBe('America/New_York')
    })
})

describe('knowledgeHandoverTicketsDrillDown', () => {
    it('should build drilldown query with empty measures', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeHandoverTicketsDrillDown.build(ctx)

        expect(query.measures).toEqual([])
        expect(query.dimensions).toEqual([
            'ticketId',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.limit).toBe(100)
    })
})

describe('knowledgeHandoverTicketsDrillDownQueryV2Factory', () => {
    it('should create a drilldown query with empty measures', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeHandoverTicketsDrillDownQueryV2Factory(ctx)

        expect(query.measures).toEqual([])
        expect(query.timezone).toBe('America/New_York')
        expect(query.limit).toBe(100)
    })
})

describe('knowledgeCSAT', () => {
    it('should build query without sorting', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeCSAT.build(ctx)

        expect(query.measures).toEqual(['averageSurveyScore'])
        expect(query.dimensions).toEqual([
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.order).toBeUndefined()
    })

    it('should build query with sorting when sortDirection is provided', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            sortDirection: 'asc',
        }

        const query = knowledgeCSAT.build(ctx)

        expect(query.order).toEqual([
            ['resourceSourceSetId', OrderDirection.Asc],
            ['resourceSourceId', OrderDirection.Asc],
        ])
    })
})

describe('knowledgeCSATQueryV2Factory', () => {
    it('should create a query from context', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeCSATQueryV2Factory(ctx)

        expect(query.measures).toEqual(['averageSurveyScore'])
        expect(query.timezone).toBe('America/New_York')
    })
})

describe('knowledgeCSATDrillDown', () => {
    it('should build drilldown query with averageSurveyScore measure', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeCSATDrillDown.build(ctx)

        expect(query.measures).toEqual(['averageSurveyScore'])
        expect(query.dimensions).toEqual([
            'ticketId',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.limit).toBe(100)
    })
})

describe('knowledgeCSATDrillDownQueryV2Factory', () => {
    it('should create a drilldown query with averageSurveyScore measure', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeCSATDrillDownQueryV2Factory(ctx)

        expect(query.measures).toEqual(['averageSurveyScore'])
        expect(query.timezone).toBe('America/New_York')
        expect(query.limit).toBe(100)
    })
})

describe('knowledgeIntents', () => {
    it('should build query without sorting', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeIntents.build(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.dimensions).toEqual([
            'customFieldTop2LevelsValue',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.order).toBeUndefined()
    })

    it('should build query with sorting when sortDirection is provided', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            sortDirection: 'asc',
        }

        const query = knowledgeIntents.build(ctx)

        expect(query.order).toEqual([
            ['customFieldTop2LevelsValue', OrderDirection.Asc],
            ['resourceSourceSetId', OrderDirection.Asc],
            ['resourceSourceId', OrderDirection.Asc],
        ])
    })
})

describe('knowledgeIntentsQueryV2Factory', () => {
    it('should create a query from context', () => {
        const ctx: Context = {
            timezone: 'America/New_York',
            filters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
        }

        const query = knowledgeIntentsQueryV2Factory(ctx)

        expect(query.measures).toEqual(['ticketCount'])
        expect(query.dimensions).toEqual([
            'customFieldTop2LevelsValue',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.timezone).toBe('America/New_York')
    })
})

describe('getCustomFilterIdFilters', () => {
    it('should return empty array when customFields is undefined', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
        }

        const result = getCustomFilterIdFilters(filters)

        expect(result).toEqual([])
    })

    it('should return empty array when customFields is empty', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            customFields: [],
        }

        const result = getCustomFilterIdFilters(filters)

        expect(result).toEqual([])
    })

    it('should return single filter for single customField', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            customFields: [
                {
                    customFieldId: 123,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['value1', 'value2'],
                },
            ],
        }

        const result = getCustomFilterIdFilters(filters)

        expect(result).toEqual([
            {
                member: 'customFieldId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123'],
            },
        ])
    })

    it('should return multiple filters for multiple customFields', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            customFields: [
                {
                    customFieldId: 123,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['value1'],
                },
                {
                    customFieldId: 456,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['value3'],
                },
            ],
        }

        const result = getCustomFilterIdFilters(filters)

        expect(result).toEqual([
            {
                member: 'customFieldId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123'],
            },
            {
                member: 'customFieldId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['456'],
            },
        ])
    })

    it('should create separate filter for each customField with same operator', () => {
        const filters = {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
            customFields: [
                {
                    customFieldId: 111,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['a', 'b'],
                },
                {
                    customFieldId: 222,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['c'],
                },
                {
                    customFieldId: 333,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['d', 'e', 'f'],
                },
            ],
        }

        const result = getCustomFilterIdFilters(filters)

        expect(result).toHaveLength(3)
        expect(result[0]).toEqual({
            member: 'customFieldId',
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['111'],
        })
        expect(result[1]).toEqual({
            member: 'customFieldId',
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['222'],
        })
        expect(result[2]).toEqual({
            member: 'customFieldId',
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['333'],
        })
    })
})
