import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { integrationDataItemProductFixture } from 'fixtures/shopify'
import {
    useCollectionsFromShopifyIntegration,
    useListProducts,
} from 'models/integration/queries'
import { fetchIntegrationProducts } from 'models/integration/resources'
import { fetchShopifyCollections } from 'models/integration/resources/shopify'
import { ShopifyCollectionResponse } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock('models/integration/resources/shopify', () => ({
    fetchShopifyCollections: jest.fn(),
}))
jest.mock('models/integration/resources', () => ({
    fetchIntegrationProducts: jest.fn(),
}))

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const fetchShopifyCollectionsMock = assumeMock(fetchShopifyCollections)
const fetchIntegrationProductsMock = assumeMock(fetchIntegrationProducts)

const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('queries', () => {
    describe('useListProducts', () => {
        const productsResponse = [integrationDataItemProductFixture()]

        it('fetch data', async () => {
            fetchIntegrationProductsMock.mockResolvedValueOnce(
                axiosSuccessResponse(
                    apiListCursorPaginationResponse(productsResponse),
                ),
            )

            const { result, waitFor } = renderHook(() => useListProducts(1), {
                wrapper,
            })

            expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['integration', 'shopify', 1, 'products', 'list'],
                    queryFn: expect.any(Function),
                    getNextPageParam: expect.any(Function),
                }),
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.data?.pages[0]).toEqual(
                expect.objectContaining({
                    data: expect.objectContaining({
                        data: productsResponse,
                    }),
                }),
            )
        })

        it('should reject an error on fail', async () => {
            fetchIntegrationProductsMock.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result, waitFor } = renderHook(() => useListProducts(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(fetchIntegrationProductsMock).toBeCalled()
            expect(result.current.error).toStrictEqual(Error('test error'))
            expect(mockedDispatch).toHaveBeenCalled()
        })
    })

    describe('fetchShopifyCollections', () => {
        const collectionResponse = {
            data: [
                {
                    id: 1,
                    title: 'Automated Collection',
                },
            ],
        } as ShopifyCollectionResponse

        it('fetch data', async () => {
            fetchShopifyCollectionsMock.mockResolvedValueOnce({
                collectionResponse,
            } as any)

            const { result, waitFor } = renderHook(
                () => useCollectionsFromShopifyIntegration(1),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual({
                collectionResponse: collectionResponse,
            })
        })

        it('should reject an error on fail', async () => {
            fetchShopifyCollectionsMock.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result, waitFor } = renderHook(
                () => useCollectionsFromShopifyIntegration(1),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(fetchShopifyCollectionsMock).toBeCalled()
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
