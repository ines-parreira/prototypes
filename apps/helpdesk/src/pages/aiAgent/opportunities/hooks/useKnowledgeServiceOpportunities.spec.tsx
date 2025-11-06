import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useFindOpportunitiesOpportunity } from '@gorgias/knowledge-service-queries'
import { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { useKnowledgeServiceOpportunities } from './useKnowledgeServiceOpportunities'

jest.mock('@gorgias/knowledge-service-queries', () => ({
    useFindOpportunitiesOpportunity: jest.fn(),
    queryKeys: {
        opportunities: {
            findOpportunitiesOpportunity: jest.fn(() => [
                'opportunities',
                'findOpportunitiesOpportunity',
            ]),
            all: jest.fn(() => ['opportunities']),
        },
    },
}))

jest.mock('../utils/mapKnowledgeServiceOpportunities', () => ({
    mapKnowledgeServiceOpportunities: jest.fn(
        (data: PaginatedOpportunities) => {
            if (!data?.data || !Array.isArray(data.data)) {
                return []
            }
            return data.data.map((item) => ({
                id: item.id.toString(),
                key: `ks_${item.id}`,
                title: item.resources[0]?.resourceTitle || 'Untitled',
                content: '',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            }))
        },
    ),
}))

describe('useKnowledgeServiceOpportunities', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockPaginatedResponse: PaginatedOpportunities = {
        data: [
            {
                id: 1,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                accountId: 1,
                createdDatetime: '2021-01-01',
                shopIntegrationId: 1,
                shopName: 'shop-1',
                detectionCount: 1,
                resources: [
                    {
                        resourceId: 'res-1',
                        resourceTitle: 'Opportunity 1',
                        resourceType: 'guidance',
                        resourceLocale: 'en',
                        resourceSetId: 'set-1',
                        resourceVersion: '1',
                    },
                ],
            },
            {
                id: 2,
                opportunityType: 'FILL_KNOWLEDGE_GAP',
                accountId: 1,
                createdDatetime: '2021-01-01',
                shopIntegrationId: 1,
                shopName: 'shop-1',
                detectionCount: 1,
                resources: [
                    {
                        resourceId: 'res-2',
                        resourceTitle: 'Opportunity 2',
                        resourceType: 'article',
                        resourceLocale: 'en',
                        resourceSetId: 'set-2',
                        resourceVersion: '1',
                    },
                ],
            },
        ],
        metadata: {
            next_cursor: 'cursor-page-2',
            prev_cursor: null,
            total: 50,
            total_pending: 25,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should fetch opportunities when enabled', async () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: { data: mockPaginatedResponse },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(2)
        })

        expect(result.current.opportunities[0]).toEqual({
            id: '1',
            key: 'ks_1',
            title: 'Opportunity 1',
            content: '',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        })
    })

    it('should not fetch when disabled', () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: null,
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        renderHook(() => useKnowledgeServiceOpportunities(123, false), {
            wrapper,
        })

        expect(mockUseFindOpportunities).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                }),
            }),
        )
    })

    it('should handle pagination metadata correctly', async () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: { data: mockPaginatedResponse },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(true)
            expect(result.current.totalCount).toBe(50)
        })
    })

    it('should handle fetchNextPage by setting cursor', async () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: { data: mockPaginatedResponse },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.opportunities).toHaveLength(2)
        })

        mockUseFindOpportunities.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            id: 3,
                            opportunityType: 'FILL_KNOWLEDGE_GAP',
                            resources: [
                                {
                                    resourceId: 'res-3',
                                    resourceTitle: 'Opportunity 3',
                                    resourceType: 'article',
                                    resourceLocale: 'en',
                                    resourceSetId: 'set-3',
                                },
                            ],
                        },
                    ],
                    metadata: {
                        next_cursor: null,
                        prev_cursor: 'cursor-page-1',
                        total: 50,
                    },
                },
            },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        await act(async () => {
            result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.isFetchingNextPage).toBe(false)
        })
    })

    it('should reset loading state on error', async () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: { data: mockPaginatedResponse },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result, rerender } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        await act(async () => {
            result.current.fetchNextPage()
        })

        mockUseFindOpportunities.mockReturnValue({
            data: { data: mockPaginatedResponse },
            isLoading: false,
            refetch: jest.fn(),
            isError: true,
        })

        rerender()

        await waitFor(() => {
            expect(result.current.isFetchingNextPage).toBe(false)
        })
    })

    it('should handle empty response gracefully', () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: null,
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        expect(result.current.opportunities).toEqual([])
        expect(result.current.hasNextPage).toBe(false)
    })

    it('should handle invalid data structure gracefully', () => {
        const mockUseFindOpportunities =
            useFindOpportunitiesOpportunity as jest.Mock
        mockUseFindOpportunities.mockReturnValue({
            data: {
                data: {
                    data: [],
                    metadata: {
                        next_cursor: null,
                        prev_cursor: null,
                        total: 0,
                    },
                },
            },
            isLoading: false,
            refetch: jest.fn(),
            isError: false,
        })

        const { result } = renderHook(
            () => useKnowledgeServiceOpportunities(123, true),
            { wrapper },
        )

        expect(result.current.opportunities).toEqual([])
    })
})
