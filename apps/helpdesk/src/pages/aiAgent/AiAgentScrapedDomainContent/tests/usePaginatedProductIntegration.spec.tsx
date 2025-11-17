import type React from 'react'

import { renderHook } from '@repo/testing'
import type { QueryKey } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'

import type { Product } from 'constants/integrations/types/shopify'
import { ProductStatus } from 'constants/integrations/types/shopify'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { integrationDataItemProductFixture } from 'fixtures/shopify'
import * as resources from 'models/integration/resources'
import type { IntegrationDataItem } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    isProductExcludedFromAiAgent,
    usePaginatedProductIntegration,
} from '../hooks/usePaginatedProductIntegration'

const fetchIntegrationProducts = jest.spyOn(
    resources,
    'fetchIntegrationProducts',
)
const wrapper = ({
    children,
    cachedData,
}: {
    children?: React.ReactNode
    cachedData?: [QueryKey, unknown][]
}) => {
    const client = mockQueryClient({ cachedData })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('usePaginatedProductIntegration', () => {
    const mockIntegrationId = 123
    const mockProducts = [integrationDataItemProductFixture()]
    const mockResponse = axiosSuccessResponse(
        apiListCursorPaginationResponse(mockProducts, {
            next_cursor: 'next-cursor',
            prev_cursor: 'prev-cursor',
            total_resources: null,
        }),
    )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        mockQueryClient().clear()
    })

    it('should fetch products with initial params', async () => {
        fetchIntegrationProducts.mockResolvedValueOnce(mockResponse)

        const { result } = renderHook(
            () =>
                usePaginatedProductIntegration({
                    integrationId: mockIntegrationId,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.items).toEqual(mockProducts)
        expect(result.current.itemsData).toEqual(
            mockProducts.map((item: IntegrationDataItem<Product>) => ({
                ...item.data,
                is_used_by_ai_agent: false,
            })),
        )
    })

    it('should handle search functionality', async () => {
        fetchIntegrationProducts.mockResolvedValueOnce(mockResponse)

        const { result, unmount } = renderHook(
            () =>
                usePaginatedProductIntegration({
                    integrationId: mockIntegrationId,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.setSearchTerm('test search')
        })

        await waitFor(() => {
            expect(fetchIntegrationProducts).toHaveBeenCalledWith(
                mockIntegrationId,
                { filter: 'test search', cursor: undefined },
            )
        })
        unmount()
    })

    it('should handle pagination', async () => {
        const mockNextResponse = axiosSuccessResponse(
            apiListCursorPaginationResponse(mockProducts, {
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
                total_resources: null,
            }),
        )
        const mockPrevResponse = axiosSuccessResponse(
            apiListCursorPaginationResponse(mockProducts, {
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
                total_resources: null,
            }),
        )

        fetchIntegrationProducts
            .mockResolvedValueOnce(mockNextResponse)
            .mockResolvedValueOnce(mockPrevResponse)

        const { result } = renderHook(
            () =>
                usePaginatedProductIntegration({
                    integrationId: mockIntegrationId,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.fetchNext()
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(fetchIntegrationProducts).toHaveBeenNthCalledWith(
            2,
            mockIntegrationId,
            { cursor: 'next-cursor' },
        )

        act(() => {
            result.current.fetchPrev()
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(fetchIntegrationProducts).toHaveBeenNthCalledWith(
            3,
            mockIntegrationId,
            { cursor: 'prev-cursor' },
        )
    })

    it('should handle errors', async () => {
        const error = new Error('Test error')
        fetchIntegrationProducts.mockRejectedValueOnce(error)

        const { result } = renderHook(
            () =>
                usePaginatedProductIntegration({
                    integrationId: mockIntegrationId,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.isLoading).toBe(false)
        expect(result.current.items).toEqual([])
        expect(result.current.itemsData).toEqual([])
    })

    describe('isProductExcludedFromAiAgent', () => {
        it('should return true when product is not active', () => {
            const product = {
                ...integrationDataItemProductFixture().data,
                status: ProductStatus.Archived,
            }
            expect(isProductExcludedFromAiAgent(product)).toBe(true)
        })

        it('should return true when product has no variants', () => {
            const product = {
                ...integrationDataItemProductFixture().data,
                variants: [],
            }
            expect(isProductExcludedFromAiAgent(product)).toBe(true)
        })

        it('should return true when product is not published', () => {
            const product = {
                ...integrationDataItemProductFixture().data,
                published_at: undefined,
            }
            expect(isProductExcludedFromAiAgent(product)).toBe(true)
        })

        it('should return true when product has do not recommend tag', () => {
            const product = {
                ...integrationDataItemProductFixture().data,
                tags: 'gorgias_do_not_recommend',
            }
            expect(isProductExcludedFromAiAgent(product)).toBe(true)
        })

        it('should return false when product meets all criteria', () => {
            const product = {
                ...integrationDataItemProductFixture().data,
                status: ProductStatus.Active,
                variants: [
                    {
                        ...integrationDataItemProductFixture().data.variants[0],
                        id: 1,
                    },
                ],
                published_at: '2024-01-01',
            }
            expect(isProductExcludedFromAiAgent(product)).toBe(false)
        })
    })
})
