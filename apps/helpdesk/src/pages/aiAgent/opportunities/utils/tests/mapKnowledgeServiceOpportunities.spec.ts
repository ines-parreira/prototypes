import { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../../enums'
import { mapKnowledgeServiceOpportunities } from '../mapKnowledgeServiceOpportunities'

describe('mapKnowledgeServiceOpportunities', () => {
    it('should map knowledge service opportunities with valid data', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 5,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'First Opportunity',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result).toEqual([
            {
                id: '1',
                key: 'ks_1',
                title: 'First Opportunity',
                content: '',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
            },
        ])
    })

    it('should map multiple opportunities', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Shop 1',
                    detectionCount: 3,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'First Opportunity',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
                {
                    id: 2,
                    opportunityType: 'RESOLVE_CONFLICT',
                    accountId: 100,
                    createdDatetime: '2024-01-02T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Shop 2',
                    detectionCount: 7,
                    resources: [
                        {
                            resourceId: 'res-2',
                            resourceTitle: 'Second Opportunity',
                            resourceType: 'guidance',
                            resourceLocale: 'en',
                            resourceSetId: 'set-2',
                            resourceVersion: '2',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: 'cursor-2',
                prev_cursor: null,
                total: 2,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
            id: '1',
            key: 'ks_1',
            title: 'First Opportunity',
            content: '',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 3,
        })
        expect(result[1]).toEqual({
            id: '2',
            key: 'ks_2',
            title: 'Second Opportunity',
            content: '',
            type: OpportunityType.RESOLVE_CONFLICT,
            ticketCount: 7,
        })
    })

    it('should use fallback title when resourceTitle is missing', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: '',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].title).toBe('Untitled Opportunity')
    })

    it('should use fallback title when resourceTitle is null', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: null as any,
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].title).toBe('Untitled Opportunity')
    })

    it('should use fallback title when resourceTitle is undefined', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: undefined as any,
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].title).toBe('Untitled Opportunity')
    })

    it('should use fallback title when resources array is empty', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].title).toBe('Untitled Opportunity')
    })

    it('should map FILL_KNOWLEDGE_GAP opportunity type correctly', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].type).toBe(OpportunityType.FILL_KNOWLEDGE_GAP)
    })

    it('should map RESOLVE_CONFLICT opportunity type correctly', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'RESOLVE_CONFLICT',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].type).toBe(OpportunityType.RESOLVE_CONFLICT)
    })

    it('should default to RESOLVE_CONFLICT for unknown opportunity types', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'UNKNOWN_TYPE' as any,
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].type).toBe(OpportunityType.RESOLVE_CONFLICT)
    })

    it('should always set content to empty string', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].content).toBe('')
    })

    it('should handle empty data array', () => {
        const response: PaginatedOpportunities = {
            data: [],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 0,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result).toEqual([])
    })

    it('should correctly format id and key', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 12345,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].id).toBe('12345')
        expect(result[0].key).toBe('ks_12345')
        expect(typeof result[0].id).toBe('string')
    })

    it('should correctly map detectionCount to ticketCount', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 42,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'Test',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].ticketCount).toBe(42)
    })

    it('should only use first resource when multiple resources exist', () => {
        const response: PaginatedOpportunities = {
            data: [
                {
                    id: 1,
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                    accountId: 100,
                    createdDatetime: '2024-01-01T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Test Shop',
                    detectionCount: 2,
                    resources: [
                        {
                            resourceId: 'res-1',
                            resourceTitle: 'First Resource Title',
                            resourceType: 'article',
                            resourceLocale: 'en',
                            resourceSetId: 'set-1',
                            resourceVersion: '1',
                        },
                        {
                            resourceId: 'res-2',
                            resourceTitle: 'Second Resource Title',
                            resourceType: 'guidance',
                            resourceLocale: 'en',
                            resourceSetId: 'set-2',
                            resourceVersion: '2',
                        },
                    ],
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].title).toBe('First Resource Title')
    })
})
