import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

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
    useProcessOpportunity,
} from './useProcessOpportunity'

jest.mock('@gorgias/knowledge-service-queries', () => ({
    ...jest.requireActual('@gorgias/knowledge-service-queries'),
    useProcessOpportunityForShopOpportunity: jest.fn(),
    queryKeys: {
        opportunities: {
            findOpportunitiesByShopOpportunity: jest.fn((shopId: number) => [
                'opportunities',
                shopId,
            ]),
        },
    },
}))

jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    isAxiosError: jest.fn(),
}))

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
            insight: 'Resolve conflict opportunity',
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

    describe('useProcessOpportunity hook', () => {
        const { useProcessOpportunityForShopOpportunity } = jest.requireMock(
            '@gorgias/knowledge-service-queries',
        )
        const { isAxiosError } = jest.requireMock('axios')

        let queryClient: QueryClient
        let wrapper: React.FC<{ children: React.ReactNode }>

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient = new QueryClient({
                defaultOptions: {
                    queries: { retry: false },
                },
            })
            wrapper = ({ children }: { children: React.ReactNode }) =>
                React.createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    children,
                )
        })

        afterEach(() => {
            queryClient.clear()
        })

        it('should invalidate queries on successful mutation', async () => {
            const shopIntegrationId = 789
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(shopIntegrationId), {
                wrapper,
            })

            await mockMutationCallbacks.onSuccess()

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: ['opportunities', shopIntegrationId],
                })
            })
        })

        it('should not invalidate queries on success when shopIntegrationId is not provided', async () => {
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(undefined), {
                wrapper,
            })

            await mockMutationCallbacks.onSuccess()

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })

        it('should invalidate queries on 409 error', async () => {
            const shopIntegrationId = 789
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(shopIntegrationId), {
                wrapper,
            })

            const conflictError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Conflict detected',
                        },
                    },
                },
            }

            isAxiosError.mockReturnValue(true)

            await mockMutationCallbacks.onError(conflictError)

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: ['opportunities', shopIntegrationId],
                })
            })
        })

        it('should not invalidate queries on non-409 error', async () => {
            const shopIntegrationId = 789
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(shopIntegrationId), {
                wrapper,
            })

            const serverError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error',
                        },
                    },
                },
            }

            isAxiosError.mockReturnValue(true)

            await mockMutationCallbacks.onError(serverError)

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })

        it('should not invalidate queries on 409 error when shopIntegrationId is not provided', async () => {
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(undefined), {
                wrapper,
            })

            const conflictError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Conflict detected',
                        },
                    },
                },
            }

            isAxiosError.mockReturnValue(true)

            await mockMutationCallbacks.onError(conflictError)

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })

        it('should not invalidate queries on error without response', async () => {
            const shopIntegrationId = 789
            const mockMutationCallbacks = {
                onSuccess: jest.fn(),
                onError: jest.fn(),
            }

            useProcessOpportunityForShopOpportunity.mockImplementation(
                ({ mutation }: any) => {
                    mockMutationCallbacks.onSuccess = mutation.onSuccess
                    mockMutationCallbacks.onError = mutation.onError
                    return {
                        mutate: jest.fn(),
                        mutateAsync: jest.fn(),
                    }
                },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            renderHook(() => useProcessOpportunity(shopIntegrationId), {
                wrapper,
            })

            const networkError = new Error('Network error')

            isAxiosError.mockReturnValue(false)

            await mockMutationCallbacks.onError(networkError)

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })
    })
})
