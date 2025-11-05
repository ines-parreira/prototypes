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
