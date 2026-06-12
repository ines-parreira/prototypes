import { renderHook } from '@repo/testing'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockProcessOpportunityForShopOpportunityHandler } from '@gorgias/knowledge-service-mocks'
import type { ProcessOpportunityOneOfFive } from '@gorgias/knowledge-service-types'
import { ProcessOpportunityOneOfVisibilityStatus } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { ResourceType } from '../types'
import type { Opportunity, ResourceFormFields } from '../types'
import {
    buildApprovePayload,
    buildDismissPayload,
    buildResolveConflictPayload,
    useProcessOpportunity,
} from './useProcessOpportunity'

jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    isAxiosError: jest.fn(),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useProcessOpportunity', () => {
    describe('buildApprovePayload', () => {
        it('should build approve payload with PUBLIC visibility status', () => {
            const result = buildApprovePayload({
                title: 'Test Title',
                content: '<p>Test Content</p>',
                isVisible: true,
            })

            expect(result).toEqual({
                action: 'APPROVE',
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
                action: 'APPROVE',
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
                action: 'DISMISS',
                dismissReason: undefined,
            })
        })

        it('should build dismiss payload with dismiss reason', () => {
            const dismissReason = 'NOT_APPLICABLE' as any

            const result = buildDismissPayload(dismissReason)

            expect(result).toEqual({
                action: 'DISMISS',
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
                }) as ProcessOpportunityOneOfFive

                expect(result).toEqual({
                    action: 'RESOLVE_CONFLICT',
                    resolutions: [
                        {
                            action: 'DELETE',
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
                }) as ProcessOpportunityOneOfFive

                expect(result).toEqual({
                    action: 'RESOLVE_CONFLICT',
                    resolutions: [
                        {
                            action: 'DISABLE',
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
                }) as ProcessOpportunityOneOfFive

                expect(result).toEqual({
                    action: 'RESOLVE_CONFLICT',
                    resolutions: [
                        {
                            action: 'EDIT',
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
                }) as ProcessOpportunityOneOfFive

                expect(result.resolutions).toHaveLength(1)
                expect(result.resolutions[0]).toMatchObject({
                    action: 'EDIT',
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
        const { isAxiosError } = jest.requireMock('axios')

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should process an opportunity on successful mutation', async () => {
            const shopIntegrationId = 789
            const processOpportunityMock =
                mockProcessOpportunityForShopOpportunityHandler()
            const waitForProcessOpportunityRequest =
                processOpportunityMock.waitForRequest(server)
            server.use(processOpportunityMock.handler)

            const { result } = renderHook(() =>
                useProcessOpportunity(shopIntegrationId),
            )

            await result.current.mutateAsync({
                shopIntegrationId,
                opportunityId: 123,
                data: buildDismissPayload(),
            })

            await waitForProcessOpportunityRequest(async (request) => {
                const pathname = new URL(request.url).pathname

                expect(pathname).toContain(String(shopIntegrationId))
                expect(pathname).toContain('123')
                expect(await request.json()).toEqual(buildDismissPayload())
            })
        })

        it('should process an opportunity when hook shopIntegrationId is not provided', async () => {
            const processOpportunityMock =
                mockProcessOpportunityForShopOpportunityHandler()
            const waitForProcessOpportunityRequest =
                processOpportunityMock.waitForRequest(server)
            server.use(processOpportunityMock.handler)

            const { result } = renderHook(() => useProcessOpportunity())

            await result.current.mutateAsync({
                shopIntegrationId: 789,
                opportunityId: 123,
                data: buildDismissPayload(),
            })

            await waitForProcessOpportunityRequest((request) => {
                const pathname = new URL(request.url).pathname

                expect(pathname).toContain('789')
                expect(pathname).toContain('123')
            })
        })

        it('should reject on 409 error', async () => {
            const shopIntegrationId = 789
            server.use(
                mockProcessOpportunityForShopOpportunityHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Conflict detected' } } as never,
                        { status: 409 },
                    ),
                ).handler,
            )
            isAxiosError.mockReturnValue(true)

            const { result } = renderHook(() =>
                useProcessOpportunity(shopIntegrationId),
            )

            await expect(
                result.current.mutateAsync({
                    shopIntegrationId,
                    opportunityId: 123,
                    data: buildDismissPayload(),
                }),
            ).rejects.toBeDefined()
        })

        it('should reject on non-409 error', async () => {
            const shopIntegrationId = 789
            server.use(
                mockProcessOpportunityForShopOpportunityHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Internal server error' } } as never,
                        { status: 500 },
                    ),
                ).handler,
            )
            isAxiosError.mockReturnValue(true)

            const { result } = renderHook(() =>
                useProcessOpportunity(shopIntegrationId),
            )

            await expect(
                result.current.mutateAsync({
                    shopIntegrationId,
                    opportunityId: 123,
                    data: buildDismissPayload(),
                }),
            ).rejects.toBeDefined()
        })

        it('should reject on 409 error when hook shopIntegrationId is not provided', async () => {
            server.use(
                mockProcessOpportunityForShopOpportunityHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Conflict detected' } } as never,
                        { status: 409 },
                    ),
                ).handler,
            )
            isAxiosError.mockReturnValue(true)

            const { result } = renderHook(() => useProcessOpportunity())

            await expect(
                result.current.mutateAsync({
                    shopIntegrationId: 789,
                    opportunityId: 123,
                    data: buildDismissPayload(),
                }),
            ).rejects.toBeDefined()
        })

        it('should reject on error without response', async () => {
            const shopIntegrationId = 789
            server.use(
                mockProcessOpportunityForShopOpportunityHandler(async () => {
                    throw new Error('Network error')
                }).handler,
            )
            isAxiosError.mockReturnValue(false)

            const { result } = renderHook(() =>
                useProcessOpportunity(shopIntegrationId),
            )

            await expect(
                result.current.mutateAsync({
                    shopIntegrationId,
                    opportunityId: 123,
                    data: buildDismissPayload(),
                }),
            ).rejects.toBeDefined()
        })
    })
})
