import React from 'react'

import { QueryClientProvider, QueryKey } from '@tanstack/react-query'
import { act } from '@testing-library/react-hooks'

import { Product } from 'constants/integrations/types/shopify'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { integrationDataItemProductFixture } from 'fixtures/shopify'
import * as resources from 'models/integration/resources'
import { IntegrationDataItem } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { usePaginatedProductIntegration } from '../hooks/usePaginatedProductIntegration'

const fetchIntegrationProducts = jest.spyOn(
    resources,
    'fetchIntegrationProducts',
)
const wrapper = ({
    children,
    cachedData,
}: {
    children: React.ReactNode
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

        const { result, waitFor } = renderHook(
            () =>
                usePaginatedProductIntegration({
                    integrationId: mockIntegrationId,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.items).toEqual(mockProducts)
        expect(result.current.itemsData).toEqual(
            mockProducts.map((item: IntegrationDataItem<Product>) => item.data),
        )
    })

    it('should handle search functionality', async () => {
        fetchIntegrationProducts.mockResolvedValueOnce(mockResponse)

        const { result, waitFor, unmount } = renderHook(
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

        expect(fetchIntegrationProducts).toHaveBeenCalledWith(
            mockIntegrationId,
            { filter: 'test search', cursor: undefined },
        )
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

        const { result, waitFor } = renderHook(
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

        const { result, waitFor } = renderHook(
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
})
