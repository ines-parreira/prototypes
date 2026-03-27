import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import {
    shopifyProductResult,
    shopifyProductWithInactiveStatus,
    shopifyProductWithoutImageAndTitle,
} from 'fixtures/shopify'
import { useListProducts } from 'models/integration/queries'

import { useAIJourneyProductList } from './useAIJourneyProductList'

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

const productMockedData = [
    ...shopifyProductResult(),
    ...shopifyProductResult(),
    ...shopifyProductResult(), // 6 active products with image and title to test the limit of 5
    shopifyProductWithInactiveStatus, // 1 inactive product
    shopifyProductWithoutImageAndTitle, // 1 product without image and title
]

describe('useAIJourneyProductList', () => {
    describe('With non-empty product data', () => {
        beforeEach(() => {
            jest.clearAllMocks()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: productMockedData,
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)
        })

        it('should apply filter products without image, title or inactive and limit array to 5 items', () => {
            const { result } = renderHook(() =>
                useAIJourneyProductList({ integrationId: 1 }),
            )

            expect(result.current.productList.length).toBe(5)
        })
    })

    describe('With empty product data', () => {
        beforeEach(() => {
            jest.clearAllMocks()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [{ data: { data: [] } }],
                },
                isLoading: false,
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)
        })

        it('should return an empty productList and isLoading true when integrationId is not provided', () => {
            useListProductsMock.mockReturnValue({
                data: undefined,
                isLoading: true,
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)

            const { result } = renderHook(() => useAIJourneyProductList({}))

            expect(result.current.productList).toEqual([])
            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('With filter (search mode)', () => {
        beforeEach(() => {
            jest.clearAllMocks()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: productMockedData,
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)
        })

        it('should pass filter param to useListProducts', () => {
            renderHook(() =>
                useAIJourneyProductList({
                    integrationId: 1,
                    filter: 'sneakers',
                }),
            )

            expect(useListProductsMock).toHaveBeenCalledWith(
                1,
                true,
                { limit: 100, filter: 'sneakers' },
                expect.objectContaining({
                    keepPreviousData: true,
                    queryKey: [
                        'integration',
                        'shopify',
                        1,
                        'products',
                        'list',
                        'sneakers',
                    ],
                }),
            )
        })

        it('should not pass filter param when filter is empty', () => {
            renderHook(() => useAIJourneyProductList({ integrationId: 1 }))

            expect(useListProductsMock).toHaveBeenCalledWith(
                1,
                true,
                { limit: 100 },
                expect.objectContaining({
                    keepPreviousData: false,
                    queryKey: [
                        'integration',
                        'shopify',
                        1,
                        'products',
                        'list',
                        '',
                    ],
                }),
            )
        })

        it('should return all matching products without 5-item cap when searching', () => {
            const { result } = renderHook(() =>
                useAIJourneyProductList({
                    integrationId: 1,
                    filter: 'product',
                }),
            )

            // 6 active products with image and title exist in mock data
            expect(result.current.productList.length).toBe(6)
        })

        it('should restore 5-item cap when filter is removed', () => {
            const { result: searchResult } = renderHook(() =>
                useAIJourneyProductList({
                    integrationId: 1,
                    filter: 'product',
                }),
            )

            expect(searchResult.current.productList.length).toBe(6)

            const { result: defaultResult } = renderHook(() =>
                useAIJourneyProductList({ integrationId: 1 }),
            )

            expect(defaultResult.current.productList.length).toBe(5)
        })

        it('should not auto-paginate when searching', () => {
            const fetchNextPageMock = jest.fn()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [shopifyProductResult()[0]],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: fetchNextPageMock,
                hasNextPage: true,
                isFetchingNextPage: false,
            } as any)

            renderHook(() =>
                useAIJourneyProductList({
                    integrationId: 1,
                    filter: 'something',
                }),
            )

            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })

        it('should still filter out inactive and imageless products when searching', () => {
            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [
                                    shopifyProductResult()[0],
                                    shopifyProductWithInactiveStatus,
                                    shopifyProductWithoutImageAndTitle,
                                ],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)

            const { result } = renderHook(() =>
                useAIJourneyProductList({
                    integrationId: 1,
                    filter: 'test',
                }),
            )

            expect(result.current.productList.length).toBe(1)
        })
    })

    describe('Pagination behavior', () => {
        it('should fetch next page when fewer than 5 active products are available', () => {
            const fetchNextPageMock = jest.fn()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [shopifyProductResult()[0]],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: fetchNextPageMock,
                hasNextPage: true,
                isFetchingNextPage: false,
            } as any)

            renderHook(() => useAIJourneyProductList({ integrationId: 1 }))

            expect(fetchNextPageMock).toHaveBeenCalled()
        })

        it('should not fetch next page when 5 active products are available', () => {
            const fetchNextPageMock = jest.fn()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [
                                    ...shopifyProductResult(),
                                    ...shopifyProductResult(),
                                    ...shopifyProductResult(),
                                ],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: fetchNextPageMock,
                hasNextPage: true,
                isFetchingNextPage: false,
            } as any)

            renderHook(() => useAIJourneyProductList({ integrationId: 1 }))

            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })

        it('should not fetch next page when no more pages available', () => {
            const fetchNextPageMock = jest.fn()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [shopifyProductResult()[0]],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: fetchNextPageMock,
                hasNextPage: false,
                isFetchingNextPage: false,
            } as any)

            renderHook(() => useAIJourneyProductList({ integrationId: 1 }))

            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })

        it('should not fetch next page when already fetching', () => {
            const fetchNextPageMock = jest.fn()

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [shopifyProductResult()[0]],
                            },
                        },
                    ],
                },
                isLoading: false,
                fetchNextPage: fetchNextPageMock,
                hasNextPage: true,
                isFetchingNextPage: true,
            } as any)

            renderHook(() => useAIJourneyProductList({ integrationId: 1 }))

            expect(fetchNextPageMock).not.toHaveBeenCalled()
        })
    })
})
