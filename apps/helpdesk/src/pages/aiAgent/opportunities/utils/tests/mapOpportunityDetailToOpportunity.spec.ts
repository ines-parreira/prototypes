import type {
    ConflictOpportunityDetail,
    KnowledgeGapOpportunityDetail,
    KnowledgeGapOpportunityDetailResourcesItem,
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
                insight: 'Test Knowledge Gap Title',
                knowledgeResource: {
                    id: 123,
                    title: 'Test Knowledge Gap Title',
                    body: '<p>Test knowledge gap content</p>',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: 1,
                    sourceId: 'source-123',
                    sourceSetId: 'source-set-123',
                },
                resources: [
                    {
                        resourceId: 'source-123',
                        resourceSetId: 'source-set-123',
                        insight: 'Test',
                    },
                ] as KnowledgeGapOpportunityDetailResourcesItem[],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result).toEqual({
                id: '123',
                key: 'ks_123',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                detectionObjectIds: ['1', '2', '3', '4', '5'],
                insight: 'Test Knowledge Gap Title',
                resources: [
                    {
                        title: 'Test Knowledge Gap Title',
                        content: '<p>Test knowledge gap content</p>',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        insight: 'Test',
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
                insight: '',
                knowledgeResource: {
                    id: 1,
                    title: '',
                    body: '',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                    sourceId: 'source-empty',
                    sourceSetId: 'source-set-empty',
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
                insight: '',
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        insight: '',
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
                insight: undefined as any,
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
                insight: '',
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
                insight: null as any,
                knowledgeResource: {
                    id: 2,
                    title: null as any,
                    body: null as any,
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                    sourceId: 'source-null',
                    sourceSetId: 'source-set-null',
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
                insight: '',
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        insight: '',
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
                insight: undefined as any,
                knowledgeResource: {
                    id: 3,
                    title: undefined as any,
                    body: undefined as any,
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                    sourceId: 'source-undefined',
                    sourceSetId: 'source-set-undefined',
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
                insight: '',
                resources: [
                    {
                        title: 'Untitled',
                        content: '',
                        type: ResourceType.ARTICLE,
                        isVisible: true,
                        insight: '',
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
                insight: 'Guidance Title',
                knowledgeResource: {
                    id: 4,
                    title: 'Guidance Title',
                    body: '<p>Guidance content</p>',
                    locale: 'en',
                    type: 'guidance',
                    origin: 'internal',
                    version: 2,
                    sourceId: 'source-guidance',
                    sourceSetId: 'source-set-guidance',
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
                insight: 'Guidance Title',
                resources: [
                    {
                        title: 'Guidance Title',
                        content: '<p>Guidance content</p>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        insight: '',
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 1,
                        title: 'First Conflict Title',
                        body: '<p>First conflict content</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                        sourceId: 'resource-1',
                        sourceSetId: 'resource-set-1',
                    },
                    {
                        id: 2,
                        title: 'Second Conflict Title',
                        body: '<p>Second conflict content</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 2,
                        sourceId: 'resource-2',
                        sourceSetId: 'resource-set-2',
                    },
                ],
                resources: [
                    {
                        resourceId: 'resource-1',
                        resourceSetId: 'resource-set-1',
                        resourceLocale: 'en',
                        resourceVersion: '1',
                        resourceTitle: 'test',
                        resourceType: 'article',
                    },
                    {
                        resourceId: 'resource-2',
                        resourceSetId: 'resource-set-2',
                        resourceLocale: 'en',
                        resourceVersion: '2',
                        resourceTitle: 'test',
                        resourceType: 'article',
                    },
                ],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '789',
                key: 'ks_789',
                type: OpportunityType.RESOLVE_CONFLICT,
                ticketCount: 7,
                detectionObjectIds: ['50', '51', '52', '53', '54', '55', '56'],
                insight: 'Test',
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
                            resourceVersion: '1',
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
                            resourceVersion: '2',
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
                insight: 'test',
                conflictingResources: [],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '999',
                key: 'ks_999',
                type: OpportunityType.RESOLVE_CONFLICT,
                ticketCount: 2,
                detectionObjectIds: ['60', '61'],
                insight: 'Test',
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 3,
                        title: null as any,
                        body: null as any,
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                        sourceId: 'resource-null',
                        sourceSetId: 'resource-set-null',
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '888',
                key: 'ks_888',
                type: OpportunityType.RESOLVE_CONFLICT,
                ticketCount: 2,
                detectionObjectIds: ['70', '71'],
                insight: 'Test',
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 4,
                        title: undefined as any,
                        body: undefined as any,
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                        sourceId: 'resource-undefined',
                        sourceSetId: 'resource-set-undefined',
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '777',
                key: 'ks_777',
                type: OpportunityType.RESOLVE_CONFLICT,
                ticketCount: 2,
                detectionObjectIds: ['80', '81'],
                insight: 'Test',
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 5,
                        title: '',
                        body: '',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                        sourceId: 'resource-empty',
                        sourceSetId: 'resource-set-empty',
                    },
                ],
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(conflictDetail)

            expect(result).toEqual({
                id: '666',
                key: 'ks_666',
                type: OpportunityType.RESOLVE_CONFLICT,
                ticketCount: 2,
                detectionObjectIds: ['90', '91'],
                insight: 'Test',
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 6,
                        title: 'Resource with Insight',
                        body: '<p>Content with insight</p>',
                        locale: 'en',
                        type: 'article',
                        origin: null,
                        version: 1,
                        sourceId: 'resource-with-insight',
                        sourceSetId: 'resource-set-1',
                    },
                ],
                resources: [
                    {
                        resourceId: 'resource-with-insight',
                        resourceSetId: 'resource-set-1',
                        resourceLocale: 'en',
                        resourceVersion: '1',
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
                ticketCount: 3,
                detectionObjectIds: ['110', '111', '112'],
                insight: 'Test',
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
                            resourceVersion: '1',
                        },
                    },
                ],
            })
        })

        it('should map all conflicting resources when multiple exist', () => {
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
                insight: 'test',
                conflictingResources: [
                    {
                        id: 7,
                        title: 'Keep This Title',
                        body: '<p>Keep this content</p>',
                        locale: 'en',
                        type: 'guidance',
                        origin: 'internal',
                        version: 1,
                        sourceId: 'resource-keep',
                        sourceSetId: 'resource-set-keep',
                    },
                    {
                        id: 8,
                        title: 'Ignore This Title',
                        body: '<p>Ignore this content</p>',
                        locale: 'fr',
                        type: 'article',
                        origin: null,
                        version: 2,
                        sourceId: 'resource-ignore',
                        sourceSetId: 'resource-set-ignore',
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

            expect(result.insight).toBe('Test')
            expect(result.resources[0].title).toBe('Keep This Title')
            expect(result.resources[0].content).toBe('<p>Keep this content</p>')
            expect(result.resources[0].identifiers).toEqual({
                resourceId: 'resource-keep',
                resourceSetId: 'resource-set-keep',
                resourceLocale: 'en',
                resourceVersion: '1.0',
            })
            expect(result.resources[1].title).toBe('Ignore This Title')
            expect(result.resources[1].content).toBe(
                '<p>Ignore this content</p>',
            )
            expect(result.resources[1].identifiers).toEqual({
                resourceId: 'resource-ignore',
                resourceSetId: 'resource-set-ignore',
                resourceLocale: 'fr',
                resourceVersion: '2.0',
            })
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
                insight: 'Test',
                knowledgeResource: {
                    id: 12345,
                    title: 'Test',
                    body: 'Test',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                    sourceId: 'source-12345',
                    sourceSetId: 'source-set-12345',
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
                insight: 'Test',
                knowledgeResource: {
                    id: 42,
                    title: 'Test',
                    body: 'Test',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: null,
                    sourceId: 'source-42',
                    sourceSetId: 'source-set-42',
                },
                resources: [],
            }

            const result = mapOpportunityDetailToOpportunity(knowledgeGapDetail)

            expect(result.key).toBe('ks_42')
            expect(result.key.startsWith('ks_')).toBe(true)
        })
    })
})
