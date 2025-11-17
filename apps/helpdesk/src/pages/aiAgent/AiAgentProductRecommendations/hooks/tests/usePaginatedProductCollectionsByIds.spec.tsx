import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import * as ecommerceResources from 'models/ecommerce/resources'

import usePaginatedProductCollectionsByIds from '../usePaginatedProductCollectionsByIds'

jest.mock('models/ecommerce/resources', () => ({
    fetchEcommerceProductCollections: jest.fn(),
}))

jest.mock('@repo/hooks', () => ({
    useDebouncedValue: jest.fn((value) => value),
}))

const mockFetchEcommerceProductCollections =
    ecommerceResources.fetchEcommerceProductCollections as jest.Mock

describe('usePaginatedProductCollectionsByIds', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        jest.clearAllMocks()
    })

    it('should return initial state with collections', async () => {
        const mockCollections = [
            {
                external_id: '1',
                data: { title: 'Collection 1' },
            },
            {
                external_id: '2',
                data: { title: 'Collection 2' },
            },
        ]

        mockFetchEcommerceProductCollections.mockResolvedValue({
            data: { data: mockCollections },
        })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: ['1', '2', '3'],
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.collections).toHaveLength(2)
        expect(result.current.collections[0]).toEqual({
            id: '1',
            title: 'Collection 1',
            productIds: [],
        })
        expect(result.current.collections[1]).toEqual({
            id: '2',
            title: 'Collection 2',
            productIds: [],
        })
        expect(result.current.isError).toBe(false)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPages).toBe(1)
        expect(result.current.hasNextPage).toBe(false)
        expect(result.current.hasPrevPage).toBe(false)
        expect(result.current.searchTerm).toBe('')
    })

    it('should fetch collections in batches', async () => {
        const batch1Collections = Array(30)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 1),
                data: { title: `Collection ${i + 1}` },
            }))

        const batch2Collections = Array(15)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 31),
                data: { title: `Collection ${i + 31}` },
            }))

        mockFetchEcommerceProductCollections
            .mockResolvedValueOnce({
                data: { data: batch1Collections },
            })
            .mockResolvedValueOnce({
                data: { data: batch2Collections },
            })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: Array(45)
                        .fill(null)
                        .map((_, i) => String(i + 1)),
                    enabled: true,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Should have made 2 batch calls
        expect(mockFetchEcommerceProductCollections).toHaveBeenCalledTimes(2)

        // First batch (30 items)
        expect(mockFetchEcommerceProductCollections).toHaveBeenNthCalledWith(
            1,
            123,
            {
                external_ids: Array(30)
                    .fill(null)
                    .map((_, i) => String(i + 1)),
            },
        )

        // Second batch (15 items)
        expect(mockFetchEcommerceProductCollections).toHaveBeenNthCalledWith(
            2,
            123,
            {
                external_ids: Array(15)
                    .fill(null)
                    .map((_, i) => String(i + 31)),
            },
        )

        expect(result.current.collections).toHaveLength(25) // First page
        expect(result.current.totalPages).toBe(2) // 45 items / 25 per page
        expect(result.current.currentPage).toBe(1)
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)
    })

    it('should handle page navigation', async () => {
        const batch1Collections = Array(30)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 1),
                data: { title: `Collection ${i + 1}` },
            }))

        const batch2Collections = Array(20)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 31),
                data: { title: `Collection ${i + 31}` },
            }))

        mockFetchEcommerceProductCollections
            .mockResolvedValueOnce({
                data: { data: batch1Collections },
            })
            .mockResolvedValueOnce({
                data: { data: batch2Collections },
            })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: Array(50)
                        .fill(null)
                        .map((_, i) => String(i + 1)),
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.collections).toHaveLength(25) // First page
        expect(result.current.currentPage).toBe(1)
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)

        act(() => {
            result.current.fetchPage(2)
        })

        expect(result.current.collections).toHaveLength(25) // Second page
        expect(result.current.currentPage).toBe(2)
        expect(result.current.hasNextPage).toBe(false)
        expect(result.current.hasPrevPage).toBe(true)
    })

    it('should return empty array when no collectionIds', async () => {
        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: [],
                    enabled: true,
                }),
            { wrapper },
        )

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(mockFetchEcommerceProductCollections).not.toHaveBeenCalled()
        expect(result.current.collections).toEqual([])
        expect(result.current.totalPages).toBe(0)
    })

    it('should handle error state', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const error = new Error('Failed to fetch')
        mockFetchEcommerceProductCollections.mockRejectedValue(error)

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: ['1', '2'],
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.collections).toEqual([])
        expect(result.current.isLoading).toBe(false)

        consoleErrorSpy.mockRestore()
    })

    it('should perform client-side search', async () => {
        const mockCollections = [
            {
                external_id: '1',
                data: { title: 'Blue Collection' },
            },
            {
                external_id: '2',
                data: { title: 'Red Collection' },
            },
            {
                external_id: '3',
                data: { title: 'Blue Items' },
            },
            {
                external_id: '4',
                data: { title: 'Green Collection' },
            },
        ]

        mockFetchEcommerceProductCollections.mockResolvedValue({
            data: { data: mockCollections },
        })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: ['1', '2', '3', '4'],
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.collections).toHaveLength(4)

        // Perform search
        act(() => {
            result.current.setSearchTerm('Blue')
        })

        // Should filter client-side
        expect(result.current.collections).toHaveLength(2)
        expect(result.current.collections[0].title).toBe('Blue Collection')
        expect(result.current.collections[1].title).toBe('Blue Items')

        // Should not make additional API calls
        expect(mockFetchEcommerceProductCollections).toHaveBeenCalledTimes(1)

        // Clear search
        act(() => {
            result.current.setSearchTerm('')
        })

        expect(result.current.collections).toHaveLength(4)
    })

    it('should handle pagination with filtered results', async () => {
        const mockCollections = Array(30)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 1),
                data: {
                    title:
                        i % 2 === 0
                            ? `Blue Collection ${i + 1}`
                            : `Red Collection ${i + 1}`,
                },
            }))

        mockFetchEcommerceProductCollections.mockResolvedValue({
            data: { data: mockCollections },
        })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: Array(30)
                        .fill(null)
                        .map((_, i) => String(i + 1)),
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Filter to "Blue" collections
        act(() => {
            result.current.setSearchTerm('Blue')
        })

        // Should have 15 Blue collections (even indices), showing first 25 on page 1
        expect(result.current.collections).toHaveLength(15)
        expect(result.current.totalPages).toBe(1) // 15 items / 25 per page
        expect(result.current.collections[0].title).toContain('Blue')

        // Search should reset to first page
        expect(result.current.currentPage).toBe(1)
    })

    it('should reset to first page when searching', async () => {
        const mockCollections = Array(50)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 1),
                data: { title: `Collection ${i + 1}` },
            }))

        mockFetchEcommerceProductCollections.mockResolvedValue({
            data: { data: mockCollections },
        })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: Array(50)
                        .fill(null)
                        .map((_, i) => String(i + 1)),
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Navigate to page 2
        act(() => {
            result.current.fetchPage(2)
        })

        expect(result.current.currentPage).toBe(2)

        // Perform search - should reset to page 1
        act(() => {
            result.current.setSearchTerm('Collection 1')
        })

        expect(result.current.currentPage).toBe(1)
    })

    it('should handle error in batch fetching', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        const batch1Collections = Array(30)
            .fill(null)
            .map((_, i) => ({
                external_id: String(i + 1),
                data: { title: `Collection ${i + 1}` },
            }))

        mockFetchEcommerceProductCollections
            .mockResolvedValueOnce({
                data: { data: batch1Collections },
            })
            .mockRejectedValueOnce(new Error('Batch 2 failed'))

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: Array(45)
                        .fill(null)
                        .map((_, i) => String(i + 1)),
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to fetch batch 2:',
            expect.any(Error),
        )
        expect(result.current.collections).toEqual([])

        consoleErrorSpy.mockRestore()
    })

    it('should use debounced search term for filtering', async () => {
        const { useDebouncedValue } = jest.requireMock('@repo/hooks')
        useDebouncedValue.mockImplementation((value: string) => {
            return value === 'Blue' ? 'Blue' : ''
        })

        const mockCollections = [
            {
                external_id: '1',
                data: { title: 'Blue Collection' },
            },
            {
                external_id: '2',
                data: { title: 'Red Collection' },
            },
            {
                external_id: '3',
                data: { title: 'Blue Items' },
            },
        ]

        mockFetchEcommerceProductCollections.mockResolvedValue({
            data: { data: mockCollections },
        })

        const { result } = renderHook(
            () =>
                usePaginatedProductCollectionsByIds({
                    integrationId: 123,
                    collectionIds: ['1', '2', '3'],
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Set search term
        act(() => {
            result.current.setSearchTerm('Blue')
        })

        // Should use debounced value for filtering
        expect(useDebouncedValue).toHaveBeenCalledWith('Blue', 200)
        expect(result.current.collections).toHaveLength(2)
        expect(result.current.collections[0].title).toBe('Blue Collection')
        expect(result.current.collections[1].title).toBe('Blue Items')
    })
})
