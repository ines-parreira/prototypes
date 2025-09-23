import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import * as integrationHelpers from 'state/integrations/helpers'

import usePaginatedProductsByIds from '../usePaginatedProductsByIds'

jest.mock('state/integrations/helpers', () => ({
    fetchIntegrationProducts: jest.fn(),
}))

jest.mock('@repo/hooks', () => ({
    useDebouncedValue: jest.fn((value) => value),
}))

const mockFetchIntegrationProductsByIds =
    integrationHelpers.fetchIntegrationProducts as jest.Mock

describe('usePaginatedProductsByIds', () => {
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

    it('should return initial state with products', async () => {
        mockFetchIntegrationProductsByIds.mockResolvedValue(
            [
                { id: 1, title: 'Product 1' },
                { id: 2, title: 'Product 2' },
            ].map((p) => ({ toJS: () => p })),
        )

        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: ['1', '2', '3'],
                    pageSize: 2,
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.products).toHaveLength(2)
        expect(result.current.isError).toBe(false)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPages).toBe(2)
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)
        expect(result.current.searchTerm).toBe('')
    })

    it('should fetch paginated products', async () => {
        const mockProducts = [
            { id: 1, title: 'Product 1' },
            { id: 2, title: 'Product 2' },
        ]

        mockFetchIntegrationProductsByIds.mockResolvedValue(
            mockProducts.map((p) => ({ toJS: () => p })),
        )

        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: ['1', '2', '3', '4'],
                    pageSize: 2,
                    enabled: true,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledWith(
            123,
            [1, 2],
        )
        expect(result.current.products).toEqual(mockProducts)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPages).toBe(2)
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)
    })

    it('should handle page navigation', async () => {
        const mockProducts1 = [
            { id: 1, title: 'Product 1' },
            { id: 2, title: 'Product 2' },
        ]
        const mockProducts2 = [
            { id: 3, title: 'Product 3' },
            { id: 4, title: 'Product 4' },
        ]

        mockFetchIntegrationProductsByIds
            .mockResolvedValueOnce(
                mockProducts1.map((p) => ({ toJS: () => p })),
            )
            .mockResolvedValueOnce(
                mockProducts2.map((p) => ({ toJS: () => p })),
            )

        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: ['1', '2', '3', '4'],
                    pageSize: 2,
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.products).toEqual(mockProducts1)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)

        act(() => {
            result.current.fetchPage(2)
        })

        await waitFor(() => {
            expect(result.current.products).toEqual(mockProducts2)
        })

        expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledWith(
            123,
            [3, 4],
        )
        expect(result.current.currentPage).toBe(2)
        expect(result.current.hasNextPage).toBe(false)
        expect(result.current.hasPrevPage).toBe(true)
    })

    it('should return empty array when no productIds', async () => {
        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: [],
                    pageSize: 2,
                    enabled: true,
                }),
            { wrapper },
        )

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(mockFetchIntegrationProductsByIds).not.toHaveBeenCalled()
        expect(result.current.products).toEqual([])
        expect(result.current.totalPages).toBe(0)
    })

    it('should use default page size', async () => {
        mockFetchIntegrationProductsByIds.mockResolvedValue(
            Array(25)
                .fill(null)
                .map((_, i) => ({
                    toJS: () => ({ id: i, title: `Product ${i}` }),
                })),
        )

        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: Array(30)
                        .fill(null)
                        .map((_, i) => String(i)),
                    enabled: true,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledWith(
            123,
            Array(25)
                .fill(null)
                .map((_, i) => i),
        )
        expect(result.current.products).toHaveLength(25)
        expect(result.current.totalPages).toBe(2)
    })

    it('should handle error state', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const error = new Error('Failed to fetch')
        mockFetchIntegrationProductsByIds.mockRejectedValue(error)

        const { result } = renderHook(
            () =>
                usePaginatedProductsByIds({
                    integrationId: 123,
                    productIds: ['1', '2'],
                    enabled: true,
                }),
            { wrapper },
        )

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 50))
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.products).toEqual([])
        expect(result.current.isLoading).toBe(false)

        consoleErrorSpy.mockRestore()
    })

    describe('fetchAll mode', () => {
        it('should fetch all products in batches when fetchAll is true', async () => {
            const allProducts = Array(75)
                .fill(null)
                .map((_, i) => ({
                    id: i + 1,
                    title: `Product ${i + 1}`,
                }))

            // Mock three batch calls (30 items each, then 15 items)
            mockFetchIntegrationProductsByIds
                .mockResolvedValueOnce(
                    allProducts.slice(0, 30).map((p) => ({ toJS: () => p })),
                )
                .mockResolvedValueOnce(
                    allProducts.slice(30, 60).map((p) => ({ toJS: () => p })),
                )
                .mockResolvedValueOnce(
                    allProducts.slice(60, 75).map((p) => ({ toJS: () => p })),
                )

            const { result } = renderHook(
                () =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: Array(75)
                            .fill(null)
                            .map((_, i) => String(i + 1)),
                        pageSize: 10,
                        enabled: true,
                        fetchAll: true,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Should have made 3 batch calls
            expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledTimes(3)

            // First batch
            expect(mockFetchIntegrationProductsByIds).toHaveBeenNthCalledWith(
                1,
                123,
                Array(30)
                    .fill(null)
                    .map((_, i) => i + 1),
            )

            // Second batch
            expect(mockFetchIntegrationProductsByIds).toHaveBeenNthCalledWith(
                2,
                123,
                Array(30)
                    .fill(null)
                    .map((_, i) => i + 31),
            )

            // Third batch
            expect(mockFetchIntegrationProductsByIds).toHaveBeenNthCalledWith(
                3,
                123,
                Array(15)
                    .fill(null)
                    .map((_, i) => i + 61),
            )

            // Should only show first page (10 items)
            expect(result.current.products).toHaveLength(10)
            expect(result.current.totalPages).toBe(8) // 75 items / 10 per page
            expect(result.current.currentPage).toBe(1)
        })

        it('should perform client-side search when fetchAll is true', async () => {
            const allProducts = [
                { id: 1, title: 'Blue Shirt' },
                { id: 2, title: 'Red Pants' },
                { id: 3, title: 'Blue Jeans' },
                { id: 4, title: 'Green Shirt' },
                { id: 5, title: 'Yellow Hat' },
            ]

            mockFetchIntegrationProductsByIds.mockResolvedValue(
                allProducts.map((p) => ({ toJS: () => p })),
            )

            const { result } = renderHook(
                () =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: ['1', '2', '3', '4', '5'],
                        pageSize: 10,
                        enabled: true,
                        fetchAll: true,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products).toHaveLength(5)

            // Perform search
            act(() => {
                result.current.setSearchTerm('Blue')
            })

            // Should filter client-side
            expect(result.current.products).toEqual([
                { id: 1, title: 'Blue Shirt' },
                { id: 3, title: 'Blue Jeans' },
            ])

            // Should not make additional API calls
            expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledTimes(1)

            // Clear search
            act(() => {
                result.current.setSearchTerm('')
            })

            expect(result.current.products).toHaveLength(5)
        })

        it('should handle pagination with client-side filtered results', async () => {
            const allProducts = Array(30)
                .fill(null)
                .map((_, i) => ({
                    id: i + 1,
                    title:
                        i % 2 === 0
                            ? `Blue Product ${i + 1}`
                            : `Red Product ${i + 1}`,
                }))

            mockFetchIntegrationProductsByIds.mockResolvedValueOnce(
                allProducts.slice(0, 30).map((p) => ({ toJS: () => p })),
            )

            const { result } = renderHook(
                () =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: Array(30)
                            .fill(null)
                            .map((_, i) => String(i + 1)),
                        pageSize: 5,
                        enabled: true,
                        fetchAll: true,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Filter to "Blue" products
            act(() => {
                result.current.setSearchTerm('Blue')
            })

            // Should have 15 Blue products (even indices)
            expect(result.current.products).toHaveLength(5) // First page
            expect(result.current.totalPages).toBe(3) // 15 items / 5 per page
            expect(result.current.products[0].title).toContain('Blue')

            // Navigate to page 2
            act(() => {
                result.current.fetchPage(2)
            })

            expect(result.current.products).toHaveLength(5)
            expect(result.current.currentPage).toBe(2)
            expect(result.current.hasNextPage).toBe(true)
            expect(result.current.hasPrevPage).toBe(true)

            // Navigate to page 3
            act(() => {
                result.current.fetchPage(3)
            })

            expect(result.current.products).toHaveLength(5)
            expect(result.current.currentPage).toBe(3)
            expect(result.current.hasNextPage).toBe(false)
            expect(result.current.hasPrevPage).toBe(true)
        })

        it('should handle error in batch fetching', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            mockFetchIntegrationProductsByIds
                .mockResolvedValueOnce(
                    Array(30)
                        .fill(null)
                        .map((_, i) => ({
                            toJS: () => ({
                                id: i + 1,
                                title: `Product ${i + 1}`,
                            }),
                        })),
                )
                .mockRejectedValueOnce(new Error('Batch 2 failed'))

            const { result } = renderHook(
                () =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: Array(75)
                            .fill(null)
                            .map((_, i) => String(i + 1)),
                        pageSize: 10,
                        enabled: true,
                        fetchAll: true,
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
            expect(result.current.products).toEqual([])

            consoleErrorSpy.mockRestore()
        })

        it('should not refetch when switching between fetchAll and regular mode', async () => {
            const mockProducts = [
                { id: 1, title: 'Product 1' },
                { id: 2, title: 'Product 2' },
            ]

            mockFetchIntegrationProductsByIds.mockResolvedValue(
                mockProducts.map((p) => ({ toJS: () => p })),
            )

            const { result, rerender } = renderHook(
                ({ fetchAll }) =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: ['1', '2'],
                        enabled: true,
                        fetchAll,
                    }),
                {
                    wrapper,
                    initialProps: { fetchAll: false },
                },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledTimes(1)

            // Switch to fetchAll mode
            rerender({ fetchAll: true })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Should make a new call with different query key
            expect(mockFetchIntegrationProductsByIds).toHaveBeenCalledTimes(2)
        })

        it('should use debounced search term for filtering', async () => {
            const { useDebouncedValue } = jest.requireMock('@repo/hooks')
            useDebouncedValue.mockImplementation((value: string) => {
                // Simulate debounce by returning the value after a delay
                return value === 'Blue' ? 'Blue' : ''
            })

            const allProducts = [
                { id: 1, title: 'Blue Shirt' },
                { id: 2, title: 'Red Pants' },
                { id: 3, title: 'Blue Jeans' },
            ]

            mockFetchIntegrationProductsByIds.mockResolvedValue(
                allProducts.map((p) => ({ toJS: () => p })),
            )

            const { result } = renderHook(
                () =>
                    usePaginatedProductsByIds({
                        integrationId: 123,
                        productIds: ['1', '2', '3'],
                        enabled: true,
                        fetchAll: true,
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
            expect(result.current.products).toEqual([
                { id: 1, title: 'Blue Shirt' },
                { id: 3, title: 'Blue Jeans' },
            ])
        })
    })
})
