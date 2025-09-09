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
            } as any)
        })
        it('should return an empty productList and isLoading true when integrationId is not provided', () => {
            ;(useListProducts as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() => useAIJourneyProductList({}))

            expect(result.current.productList).toEqual([])
            expect(result.current.isLoading).toBe(true)
        })
    })
})
