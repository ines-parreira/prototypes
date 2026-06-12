import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockFindOpportunitiesByShopOpportunityHandler,
    mockFindOpportunitiesByShopOpportunityResponse,
} from '@gorgias/knowledge-service-mocks'
import type { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { useKnowledgeServiceOpportunities } from './useKnowledgeServiceOpportunities'

jest.mock('../utils/mapKnowledgeServiceOpportunities', () => ({
    mapKnowledgeServiceOpportunities: jest.fn(
        (data: PaginatedOpportunities) => {
            if (!data?.data || !Array.isArray(data.data)) {
                return []
            }
            return data.data.map((item) => ({
                id: item.id.toString(),
                key: `ks_${item.id}`,
                insight: item.insight,
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            }))
        },
    ),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const createPaginatedResponse = (
    overrides: Partial<PaginatedOpportunities> = {},
): PaginatedOpportunities =>
    mockFindOpportunitiesByShopOpportunityResponse({
        data: [
            {
                id: 1,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                accountId: 1,
                createdDatetime: '2021-01-01',
                shopIntegrationId: 123,
                shopName: 'shop-1',
                detectionCount: 1,
                insight: 'Test insight 1',
            },
            {
                id: 2,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                accountId: 1,
                createdDatetime: '2021-01-01',
                shopIntegrationId: 123,
                shopName: 'shop-1',
                detectionCount: 1,
                insight: 'Test insight 2',
            },
        ],
        metadata: {
            next_cursor: 'cursor-page-2',
            prev_cursor: null,
            total: 50,
            total_pending: 25,
        },
        ...overrides,
    })

describe('useKnowledgeServiceOpportunities', () => {
    it('should fetch opportunities when enabled', async () => {
        const mockFindOpportunities =
            mockFindOpportunitiesByShopOpportunityHandler(async () =>
                HttpResponse.json(createPaginatedResponse()),
            )
        const waitForFindOpportunitiesRequest =
            mockFindOpportunities.waitForRequest(server)
        server.use(mockFindOpportunities.handler)

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, true),
        )

        await waitForFindOpportunitiesRequest((request) => {
            expect(new URL(request.url).searchParams.get('limit')).toBe('20')
        })
        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(2)
        })
        expect(result.current.opportunities[0]).toEqual({
            id: '1',
            key: 'ks_1',
            insight: 'Test insight 1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        })
    })

    it('should not fetch when disabled', async () => {
        let requestCount = 0
        server.use(
            mockFindOpportunitiesByShopOpportunityHandler(async () => {
                requestCount += 1

                return HttpResponse.json(createPaginatedResponse())
            }).handler,
        )

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, false),
        )

        await Promise.resolve()

        expect(result.current.opportunities).toEqual([])
        expect(requestCount).toBe(0)
    })

    it('should handle pagination metadata correctly', async () => {
        server.use(
            mockFindOpportunitiesByShopOpportunityHandler(async () =>
                HttpResponse.json(createPaginatedResponse()),
            ).handler,
        )

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, true),
        )

        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(true)
            expect(result.current.totalCount).toBe(50)
            expect(result.current.totalPending).toBe(25)
        })
    })

    it('should handle fetchNextPage by requesting the next cursor', async () => {
        const requests: URL[] = []
        server.use(
            mockFindOpportunitiesByShopOpportunityHandler(
                async ({ request }) => {
                    const url = new URL(request.url)
                    requests.push(url)

                    if (url.searchParams.get('cursor') === 'cursor-page-2') {
                        return HttpResponse.json(
                            createPaginatedResponse({
                                data: [
                                    {
                                        id: 3,
                                        opportunityType: 'FILL_KNOWLEDGE_GAP',
                                        accountId: 1,
                                        createdDatetime: '2021-01-01',
                                        shopIntegrationId: 123,
                                        shopName: 'shop-1',
                                        detectionCount: 1,
                                        insight: 'Test insight 3',
                                    },
                                ],
                                metadata: {
                                    next_cursor: null,
                                    prev_cursor: 'cursor-page-1',
                                    total: 50,
                                    total_pending: 25,
                                },
                            }),
                        )
                    }

                    return HttpResponse.json(createPaginatedResponse())
                },
            ).handler,
        )

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, true),
        )

        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(2)
        })

        await act(async () => {
            result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(3)
            expect(result.current.isFetchingNextPage).toBe(false)
            expect(
                requests.some(
                    (request) =>
                        request.searchParams.get('cursor') === 'cursor-page-2',
                ),
            ).toBe(true)
        })
    })

    it('should reset loading state on error', async () => {
        server.use(
            mockFindOpportunitiesByShopOpportunityHandler(
                async ({ request }) => {
                    const url = new URL(request.url)

                    if (url.searchParams.get('cursor') === 'cursor-page-2') {
                        return HttpResponse.json(
                            { error: { msg: 'Server error' } } as never,
                            { status: 500 },
                        )
                    }

                    return HttpResponse.json(createPaginatedResponse())
                },
            ).handler,
        )

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, true),
        )

        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(2)
        })

        await act(async () => {
            result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.isFetchingNextPage).toBe(false)
        })
    })

    it('should handle empty response gracefully', async () => {
        server.use(
            mockFindOpportunitiesByShopOpportunityHandler(async () =>
                HttpResponse.json(
                    createPaginatedResponse({
                        data: [],
                        metadata: {
                            next_cursor: null,
                            prev_cursor: null,
                            total: 0,
                            total_pending: 0,
                        },
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useKnowledgeServiceOpportunities(123, true),
        )

        await waitFor(() => {
            expect(result.current.opportunities).toEqual([])
            expect(result.current.hasNextPage).toBe(false)
        })
    })

    describe('Limit Parameter', () => {
        it('should use default limit (20) when no limit is provided', async () => {
            const mockFindOpportunities =
                mockFindOpportunitiesByShopOpportunityHandler(async () =>
                    HttpResponse.json(createPaginatedResponse()),
                )
            const waitForFindOpportunitiesRequest =
                mockFindOpportunities.waitForRequest(server)
            server.use(mockFindOpportunities.handler)

            renderHook(() => useKnowledgeServiceOpportunities(123, true))

            await waitForFindOpportunitiesRequest((request) => {
                expect(new URL(request.url).searchParams.get('limit')).toBe(
                    '20',
                )
            })
        })

        it('should use custom limit when provided', async () => {
            const mockFindOpportunities =
                mockFindOpportunitiesByShopOpportunityHandler(async () =>
                    HttpResponse.json(createPaginatedResponse()),
                )
            const waitForFindOpportunitiesRequest =
                mockFindOpportunities.waitForRequest(server)
            server.use(mockFindOpportunities.handler)

            renderHook(() => useKnowledgeServiceOpportunities(123, true, 5))

            await waitForFindOpportunitiesRequest((request) => {
                expect(new URL(request.url).searchParams.get('limit')).toBe('5')
            })
        })

        it('should refetch when limit changes', async () => {
            const limits: string[] = []
            server.use(
                mockFindOpportunitiesByShopOpportunityHandler(
                    async ({ request }) => {
                        limits.push(
                            new URL(request.url).searchParams.get('limit') ??
                                '',
                        )

                        return HttpResponse.json(createPaginatedResponse())
                    },
                ).handler,
            )

            const { rerender } = renderHook(
                ({ limit }) =>
                    useKnowledgeServiceOpportunities(123, true, limit),
                {
                    initialProps: { limit: 5 },
                },
            )

            await waitFor(() => {
                expect(limits).toContain('5')
            })

            rerender({ limit: 10 })

            await waitFor(() => {
                expect(limits).toContain('10')
            })
        })

        it('should handle limit of 0 by using default', async () => {
            const mockFindOpportunities =
                mockFindOpportunitiesByShopOpportunityHandler(async () =>
                    HttpResponse.json(createPaginatedResponse()),
                )
            const waitForFindOpportunitiesRequest =
                mockFindOpportunities.waitForRequest(server)
            server.use(mockFindOpportunities.handler)

            renderHook(() => useKnowledgeServiceOpportunities(123, true, 0))

            await waitForFindOpportunitiesRequest((request) => {
                expect(new URL(request.url).searchParams.get('limit')).toBe(
                    '20',
                )
            })
        })

        it('should handle large limit values', async () => {
            const mockFindOpportunities =
                mockFindOpportunitiesByShopOpportunityHandler(async () =>
                    HttpResponse.json(createPaginatedResponse()),
                )
            const waitForFindOpportunitiesRequest =
                mockFindOpportunities.waitForRequest(server)
            server.use(mockFindOpportunities.handler)

            renderHook(() => useKnowledgeServiceOpportunities(123, true, 100))

            await waitForFindOpportunitiesRequest((request) => {
                expect(new URL(request.url).searchParams.get('limit')).toBe(
                    '100',
                )
            })
        })
    })
})
