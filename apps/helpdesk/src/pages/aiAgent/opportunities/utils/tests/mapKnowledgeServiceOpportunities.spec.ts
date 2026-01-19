import type { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../../enums'
import { mapKnowledgeServiceOpportunities } from '../mapKnowledgeServiceOpportunities'

describe('mapKnowledgeServiceOpportunities', () => {
    it('should map knowledge service opportunities to OpportunityListItem', () => {
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result).toEqual([
            {
                id: '1',
                key: 'ks_1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                insight: 'Test insight',
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
                    insight: 'Test insight 1',
                },
                {
                    id: 2,
                    opportunityType: 'RESOLVE_CONFLICT',
                    accountId: 100,
                    createdDatetime: '2024-01-02T00:00:00Z',
                    shopIntegrationId: 200,
                    shopName: 'Shop 2',
                    detectionCount: 7,
                    insight: 'Test insight 2',
                },
            ],
            metadata: {
                next_cursor: 'cursor-2',
                prev_cursor: null,
                total: 2,
                total_pending: 2,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
            id: '1',
            key: 'ks_1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 3,
            insight: 'Test insight 1',
        })
        expect(result[1]).toEqual({
            id: '2',
            key: 'ks_2',
            type: OpportunityType.RESOLVE_CONFLICT,
            ticketCount: 7,
            insight: 'Test insight 2',
        })
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].type).toBe(OpportunityType.RESOLVE_CONFLICT)
    })

    it('should handle empty data array', () => {
        const response: PaginatedOpportunities = {
            data: [],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 0,
                total_pending: 0,
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
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
                    insight: 'Test insight',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].ticketCount).toBe(42)
    })

    it('should correctly map insight from the response', () => {
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
                    insight: 'Customer frequently asks about return policy',
                },
            ],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
                total: 1,
                total_pending: 1,
            },
        }

        const result = mapKnowledgeServiceOpportunities(response)

        expect(result[0].insight).toBe(
            'Customer frequently asks about return policy',
        )
    })
})
