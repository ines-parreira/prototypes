import { OrderDirection } from '../../../../../models/api/types'
import {
    knowledgeCSAT,
    knowledgeCSATQueryV2Factory,
    knowledgeHandoverTicketsCount,
    knowledgeHandoverTicketsCountQueryV2Factory,
    knowledgeIntents,
    knowledgeIntentsQueryV2Factory,
    knowledgeTicketsCount,
    knowledgeTicketsCountQueryV2Factory,
} from '../knowledgeInsights'
import type { Context } from '../scope'

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
            'top2LevelsValue',
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
            ['top2LevelsValue', OrderDirection.Asc],
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
            'top2LevelsValue',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ])
        expect(query.timezone).toBe('America/New_York')
    })
})
