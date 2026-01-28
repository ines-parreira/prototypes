import type { ProcessOpportunityOneOfSeven } from '@gorgias/knowledge-service-types'
import {
    ProcessOpportunityOneOfAction,
    ProcessOpportunityOneOfFourAction,
    ProcessOpportunityOneOfSevenAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwoAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfSevenAction,
    ProcessOpportunityOneOfVisibilityStatus,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { ResourceType } from '../types'
import type { Opportunity, ResourceFormFields } from '../types'
import {
    buildApprovePayload,
    buildDismissPayload,
    buildResolveConflictPayload,
} from './useProcessOpportunity'

describe('useProcessOpportunity', () => {
    describe('buildApprovePayload', () => {
        it('should build approve payload with PUBLIC visibility status', () => {
            const result = buildApprovePayload({
                title: 'Test Title',
                content: '<p>Test Content</p>',
                isVisible: true,
            })

            expect(result).toEqual({
                action: ProcessOpportunityOneOfAction.Approve,
                visibilityStatus:
                    ProcessOpportunityOneOfVisibilityStatus.Public,
                title: 'Test Title',
                content: '<p>Test Content</p>',
            })
        })

        it('should build approve payload with UNLISTED visibility status', () => {
            const result = buildApprovePayload({
                title: 'Test Title',
                content: '<p>Test Content</p>',
                isVisible: false,
            })

            expect(result).toEqual({
                action: ProcessOpportunityOneOfAction.Approve,
                visibilityStatus:
                    ProcessOpportunityOneOfVisibilityStatus.Unlisted,
                title: 'Test Title',
                content: '<p>Test Content</p>',
            })
        })
    })

    describe('buildDismissPayload', () => {
        it('should build dismiss payload without dismiss reason', () => {
            const result = buildDismissPayload()

            expect(result).toEqual({
                action: ProcessOpportunityOneOfFourAction.Dismiss,
                dismissReason: undefined,
            })
        })

        it('should build dismiss payload with dismiss reason', () => {
            const dismissReason = 'NOT_APPLICABLE' as any

            const result = buildDismissPayload(dismissReason)

            expect(result).toEqual({
                action: ProcessOpportunityOneOfFourAction.Dismiss,
                dismissReason: 'NOT_APPLICABLE',
            })
        })
    })

    describe('buildResolveConflictPayload', () => {
        const createMockOpportunity = (
            resources: Array<{
                title: string
                content: string
                type: ResourceType
                isVisible: boolean
                identifiers?: any
            }>,
        ): Opportunity => ({
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            resources,
            detectionObjectIds: ['1', '2', '3'],
        })

        describe('DELETE action', () => {
            it('should create DELETE resolution for deleted resource', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Original Title',
                        content: '<p>Original Content</p>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-1',
                            resourceSetId: 'resource-set-1',
                            resourceLocale: 'en',
                            resourceVersion: '1.0.0',
                        },
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Original Title',
                        content: '<p>Original Content</p>',
                        isVisible: true,
                        isDeleted: true,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                }) as ProcessOpportunityOneOfSeven

                expect(result).toEqual({
                    action: ProcessOpportunityOneOfSevenAction.ResolveConflict,
                    resolutions: [
                        {
                            action: ProcessOpportunityOneOfSevenResolutionsItemOneOfSevenAction.Delete,
                            resourceIdentifier: {
                                resourceId: 'resource-1',
                                resourceSetId: 'resource-set-1',
                                resourceLocale: 'en',
                                resourceVersion: '1.0.0',
                            },
                        },
                    ],
                })
            })
        })

        describe('DISABLE action', () => {
            it('should create DISABLE resolution for EXTERNAL_SNIPPET resource with isVisible false', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Original Title',
                        content: '<p>Original Content</p>',
                        type: ResourceType.EXTERNAL_SNIPPET,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-2',
                            resourceSetId: 'resource-set-2',
                            resourceLocale: 'en',
                            resourceVersion: '2.0.0',
                        },
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Original Title',
                        content: '<p>Original Content</p>',
                        isVisible: false,
                        isDeleted: false,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                }) as ProcessOpportunityOneOfSeven

                expect(result).toEqual({
                    action: ProcessOpportunityOneOfSevenAction.ResolveConflict,
                    resolutions: [
                        {
                            action: ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwoAction.Disable,
                            resourceIdentifier: {
                                resourceId: 'resource-2',
                                resourceSetId: 'resource-set-2',
                                resourceLocale: 'en',
                                resourceVersion: '2.0.0',
                            },
                        },
                    ],
                })
            })
        })

        describe('EDIT action', () => {
            it('should create EDIT resolution when title or content changes', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Original Title',
                        content: '<p>Original Content</p>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-5',
                            resourceSetId: 'resource-set-5',
                            resourceLocale: 'en',
                            resourceVersion: '5.0.0',
                        },
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Updated Title',
                        content: '<p>Updated Content</p>',
                        isVisible: true,
                        isDeleted: false,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                }) as ProcessOpportunityOneOfSeven

                expect(result).toEqual({
                    action: ProcessOpportunityOneOfSevenAction.ResolveConflict,
                    resolutions: [
                        {
                            action: ProcessOpportunityOneOfSevenResolutionsItemOneOfAction.Edit,
                            title: 'Updated Title',
                            content: '<p>Updated Content</p>',
                            visibilityStatus:
                                ProcessOpportunityOneOfVisibilityStatus.Public,
                            resourceIdentifier: {
                                resourceId: 'resource-5',
                                resourceSetId: 'resource-set-5',
                                resourceLocale: 'en',
                                resourceVersion: '5.0.0',
                            },
                        },
                    ],
                })
            })
        })

        describe('HTML normalization', () => {
            it('should return null when HTML is semantically identical', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Test Title',
                        content:
                            '<div>When a customer asks that they want to make more money, we should just give it to them.</div><div></div><div>&amp;&amp;&amp;customer.email&amp;&amp;&amp; <a href="http://email.com">email.com</a></div>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-6',
                            resourceSetId: 'resource-set-6',
                            resourceLocale: 'en',
                            resourceVersion: '6.0.0',
                        },
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Test Title',
                        content:
                            '<div>When a customer asks that they want to make more money, we should just give it to them.</div><div><br /></div><div>&&&customer.email&&& <a href="http://email.com/" target="_blank">email.com</a></div>',
                        isVisible: true,
                        isDeleted: false,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                })

                expect(result).toBeNull()
            })

            it('should detect actual content changes after normalization', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Test Title',
                        content: '<div>Original text</div>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                        identifiers: {
                            resourceId: 'resource-11',
                            resourceSetId: 'resource-set-11',
                            resourceLocale: 'en',
                            resourceVersion: '11.0.0',
                        },
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Test Title',
                        content: '<div>Actually different text</div>',
                        isVisible: true,
                        isDeleted: false,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                }) as ProcessOpportunityOneOfSeven

                expect(result.resolutions).toHaveLength(1)
                expect(result.resolutions[0]).toMatchObject({
                    action: ProcessOpportunityOneOfSevenResolutionsItemOneOfAction.Edit,
                    content: '<div>Actually different text</div>',
                })
            })
        })

        describe('Edge cases', () => {
            it('should return null when resource has no identifiers', () => {
                const opportunity = createMockOpportunity([
                    {
                        title: 'Resource without identifiers',
                        content: '<p>Content</p>',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ])

                const resourceUpdates: ResourceFormFields[] = [
                    {
                        title: 'Updated Title',
                        content: '<p>Content</p>',
                        isVisible: true,
                        isDeleted: false,
                    },
                ]

                const result = buildResolveConflictPayload({
                    selectedOpportunity: opportunity,
                    resourceUpdates,
                })

                expect(result).toBeNull()
            })
        })
    })
})
