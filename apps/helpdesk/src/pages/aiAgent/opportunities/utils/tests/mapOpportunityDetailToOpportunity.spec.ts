import type {
    ConflictOpportunityDetail,
    KnowledgeGapOpportunityDetail,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../../enums'
import { ResourceType } from '../../types'
import { mapOpportunityDetailToOpportunity } from '../mapOpportunityDetailToOpportunity'

describe('mapOpportunityDetailToOpportunity', () => {
    describe('Knowledge Gap Opportunities', () => {
        it('should map knowledge gap opportunity detail to internal opportunity format', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 123,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 5,
                detectionObjectIds: ['1', '2', '3', '4', '5'],
                knowledgeResource: {
                    title: 'Test Knowledge Gap Title',
                    body: '<p>Test knowledge gap content</p>',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: 1,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '123',
                key: 'ks_123',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: ['1', '2', '3', '4', '5'],
                resources: [
                    {
                        title: 'Test Knowledge Gap Title',
                        content: '<p>Test knowledge gap content</p>',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            })
        })

        it('should handle missing knowledge resource with default values', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 123,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 5,
                detectionObjectIds: [],
                knowledgeResource: {
                    title: '',
                    body: '',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '123',
                key: 'ks_123',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: [],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            })
        })

        it('should handle undefined knowledgeResource', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 124,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 5,
                detectionObjectIds: ['10', '11'],
                knowledgeResource: undefined as any,
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '124',
                key: 'ks_124',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: ['10', '11'],
                resources: [],
            })
        })

        it('should handle null title and body in knowledgeResource', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 125,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 5,
                detectionObjectIds: ['20'],
                knowledgeResource: {
                    title: null as any,
                    body: null as any,
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '125',
                key: 'ks_125',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: ['20'],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            })
        })

        it('should handle undefined title and body in knowledgeResource', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 126,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 5,
                detectionObjectIds: ['30', '31', '32'],
                knowledgeResource: {
                    title: undefined as any,
                    body: undefined as any,
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '126',
                key: 'ks_126',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: ['30', '31', '32'],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                    },
                ],
            })
        })

        it('should handle guidance resource type', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 456,
                accountId: 789,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 3,
                detectionObjectIds: ['40', '41', '42'],
                knowledgeResource: {
                    title: 'Guidance Title',
                    body: '<p>Guidance content</p>',
                    locale: 'en',
                    type: 'guidance',
                    origin: 'internal',
                    version: 2,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '456',
                key: 'ks_456',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 3,
                detectionObjectIds: ['40', '41', '42'],
                resources: [
                    {
                        title: 'Guidance Title',
                        content: '<p>Guidance content</p>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            })
        })
    })

    describe('Conflict Opportunities', () => {
        it('should map conflict opportunity detail to internal opportunity format', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 789,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 7,
                detectionObjectIds: ['50', '51', '52', '53', '54', '55', '56'],
                conflictingResources: [
                    {
                        title: 'First Conflict Title',
                        body: '<p>First conflict content</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                    },
                    {
                        title: 'Second Conflict Title',
                        body: '<p>Second conflict content</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 2,
                    },
                ],
                resources: [
                    {
                        resourceId: 'resource-1',
                        resourceSetId: 'resource-set-1',
                        resourceLocale: 'en',
                        resourceVersion: '1.0.0',
                        resourceTitle: 'test',
                        resourceType: 'guidance',
                    },
                    {
                        resourceId: 'resource-2',
                        resourceSetId: 'resource-set-2',
                        resourceLocale: 'en',
                        resourceVersion: '2.0.0',
                        resourceTitle: 'test',
                        resourceType: 'guidance',
                    },
                ],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '789',
                key: 'ks_789',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['50', '51', '52', '53', '54', '55', '56'],
                resources: [
                    {
                        title: 'First Conflict Title',
                        content: '<p>First conflict content</p>',
                        insight: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-1',
                            resourceSetId: 'resource-set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0.0',
                        },
                    },
                    {
                        title: 'Second Conflict Title',
                        content: '<p>Second conflict content</p>',
                        insight: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-2',
                            resourceSetId: 'resource-set-2',
                            resourceLocale: 'en',
                            resourceVersion: '2.0.0',
                        },
                    },
                ],
            })
        })

        it('should handle empty conflicting resources with default values', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 999,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 2,
                detectionObjectIds: ['60', '61'],
                conflictingResources: [],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '999',
                key: 'ks_999',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['60', '61'],
                resources: [],
            })
        })

        it('should handle null title and body in first conflicting resource', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 888,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 2,
                detectionObjectIds: ['70', '71'],
                conflictingResources: [
                    {
                        title: null as any,
                        body: null as any,
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '888',
                key: 'ks_888',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['70', '71'],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        insight: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: undefined,
                    },
                ],
            })
        })

        it('should handle undefined title and body in first conflicting resource', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 777,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 2,
                detectionObjectIds: ['80', '81'],
                conflictingResources: [
                    {
                        title: undefined as any,
                        body: undefined as any,
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '777',
                key: 'ks_777',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['80', '81'],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        insight: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: undefined,
                    },
                ],
            })
        })

        it('should handle empty string title and body in first conflicting resource', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 666,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 2,
                detectionObjectIds: ['90', '91'],
                conflictingResources: [
                    {
                        title: '',
                        body: '',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '666',
                key: 'ks_666',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['90', '91'],
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        insight: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: undefined,
                    },
                ],
            })
        })

        it('should include insight when provided in resource metadata', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 1000,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 3,
                detectionObjectIds: ['110', '111', '112'],
                conflictingResources: [
                    {
                        title: 'Resource with Insight',
                        body: '<p>Content with insight</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                    },
                ],
                resources: [
                    {
                        resourceId: 'resource-with-insight',
                        resourceSetId: 'resource-set-1',
                        resourceLocale: 'en',
                        resourceVersion: '1.0.0',
                        resourceTitle: 'test',
                        resourceType: 'article',
                        insight: 'This article conflicts with another policy',
                    },
                ],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '1000',
                key: 'ks_1000',
                type: OpportunityType.RESOLVE_CONFLICT,
                detectionObjectIds: ['110', '111', '112'],
                resources: [
                    {
                        title: 'Resource with Insight',
                        content: '<p>Content with insight</p>',
                        insight: 'This article conflicts with another policy',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-with-insight',
                            resourceSetId: 'resource-set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0.0',
                        },
                    },
                ],
            })
        })

        it('should only use first conflicting resource when multiple exist', () => {
            const conflictDetail: ConflictOpportunityDetail = {
                id: 555,
                accountId: 456,
                opportunityType: 'RESOLVE_CONFLICT',
                shopIntegrationId: 123,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 10,
                detectionObjectIds: [
                    '100',
                    '101',
                    '102',
                    '103',
                    '104',
                    '105',
                    '106',
                    '107',
                    '108',
                    '109',
                ],
                conflictingResources: [
                    {
                        title: 'Keep This Title',
                        body: '<p>Keep this content</p>',
                        locale: 'en',
                        type: 'guidance',
                        origin: 'internal',
                        version: 1,
                    },
                    {
                        title: 'Ignore This Title',
                        body: '<p>Ignore this content</p>',
                        locale: 'fr',
                        type: 'article',
                        origin: null,
                        version: 2,
                    },
                ],
                resources: [
                    {
                        resourceId: 'resource-keep',
                        resourceSetId: 'resource-set-keep',
                        resourceLocale: 'en',
                        resourceVersion: '1.0',
                        resourceTitle: 'test',
                        resourceType: 'guidance',
                    },
                    {
                        resourceId: 'resource-ignore',
                        resourceSetId: 'resource-set-ignore',
                        resourceLocale: 'fr',
                        resourceVersion: '2.0',
                        resourceTitle: 'test',
                        resourceType: 'guidance',
                    },
                ],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result.resources[0].title).toBe('Keep This Title')
            expect(result.resources[0].content).toBe('<p>Keep this content</p>')
            expect(result.resources[1].title).toBe('Ignore This Title')
            expect(result.resources[1].content).toBe(
                '<p>Ignore this content</p>',
            )
            expect(result.type).toBe(OpportunityType.RESOLVE_CONFLICT)
        })
    })

    describe('ID and Key Generation', () => {
        it('should convert numeric ID to string', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 12345,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 1,
                detectionObjectIds: ['200'],
                knowledgeResource: {
                    title: 'Test',
                    body: 'Test',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result.id).toBe('12345')
            expect(typeof result.id).toBe('string')
        })

        it('should prefix key with ks_', () => {
            const knowledgeGapDetail: KnowledgeGapOpportunityDetail = {
                id: 42,
                accountId: 456,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                shopIntegrationId: 789,
                shopName: 'Test Shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                detectionCount: 1,
                detectionObjectIds: ['300'],
                knowledgeResource: {
                    title: 'Test',
                    body: 'Test',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result.key).toBe('ks_42')
            expect(result.key.startsWith('ks_')).toBe(true)
        })
    })
})
