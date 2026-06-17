import React from 'react'

import client from '@repo/api-resources'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
} from 'fixtures/shopify'
import { handleError } from 'hooks/agents/errorHandler'
import {
    serviceConnectionsQueryKey,
    useCollectionsFromShopifyIntegration,
    useCreateServiceConnection,
    useGetProductsByIdsFromIntegration,
    useListProducts,
} from 'models/integration/queries'
import { fetchIntegrationProducts } from 'models/integration/resources'
import { fetchShopifyCollections } from 'models/integration/resources/shopify'
import type { ShopifyCollectionResponse } from 'models/integration/types'
import type {
    CreateServiceConnectionRequest,
    ServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('models/integration/resources/shopify', () => ({
    fetchShopifyCollections: jest.fn(),
}))
jest.mock('models/integration/resources', () => ({
    fetchIntegrationProducts: jest.fn(),
}))
jest.mock('state/integrations/helpers', () => ({
    fetchIntegrationProducts: jest.fn(),
}))

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

const fetchShopifyCollectionsMock = assumeMock(fetchShopifyCollections)
const fetchIntegrationProductsMock = assumeMock(fetchIntegrationProducts)
const fetchIntegrationProductsByIdsMock = assumeMock(
    fetchIntegrationProductsByIds,
)

const useInfiniteQuerySpy = jest.spyOn(reactQuery, 'useInfiniteQuery')
const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('queries', () => {
    describe('useListProducts', () => {
        const productsResponse = [integrationDataItemProductFixture()]

        beforeEach(() => {
            queryClient.clear()
        })

        it('fetch data', async () => {
            fetchIntegrationProductsMock.mockResolvedValueOnce(
                axiosSuccessResponse(
                    apiListCursorPaginationResponse(productsResponse),
                ),
            )

            const { result } = renderHook(() => useListProducts(1), {
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

        it('should include params in queryKey when params are provided', async () => {
            fetchIntegrationProductsMock.mockResolvedValueOnce(
                axiosSuccessResponse(
                    apiListCursorPaginationResponse(productsResponse),
                ),
            )

            renderHook(
                () => useListProducts(1, true, { filter: 'bullet tee' }),
                { wrapper },
            )

            expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: [
                        'integration',
                        'shopify',
                        1,
                        'products',
                        'list',
                        { filter: 'bullet tee' },
                    ],
                }),
            )
        })

        it('should reject an error on fail', async () => {
            fetchIntegrationProductsMock.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result } = renderHook(() => useListProducts(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(fetchIntegrationProductsMock).toBeCalled()
            expect(result.current.error).toStrictEqual(Error('test error'))
            expect(handleErrorMock).toHaveBeenCalledWith(
                Error('test error'),
                'Failed to fetch products',
            )
        })
    })

    describe('useGetProductsByIdsFromIntegration', () => {
        beforeEach(() => {
            queryClient.clear()
        })

        const productsResponse = [shopifyProductFixture()]

        it('fetch data', async () => {
            fetchIntegrationProductsByIdsMock.mockResolvedValueOnce(
                fromJS(productsResponse),
            )

            const { result } = renderHook(
                () => useGetProductsByIdsFromIntegration(1, [2]),
                {
                    wrapper,
                },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['integration', 'shopify', 1, 'products', [2]],
                    queryFn: expect.any(Function),
                }),
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.data).toBeImmutableList()
        })

        it('should reject an error on fail', async () => {
            fetchIntegrationProductsByIdsMock.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result } = renderHook(
                () => useGetProductsByIdsFromIntegration(1, [2]),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(fetchIntegrationProductsByIdsMock).toBeCalled()
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('useCreateServiceConnection', () => {
        const applicationId = 'app-123'
        const mockedServer = new MockAdapter(client)

        beforeEach(() => {
            queryClient.clear()
            mockedServer.reset()
        })

        afterAll(() => {
            mockedServer.restore()
        })

        const buildPayload = (): CreateServiceConnectionRequest => ({
            name: 'My connection',
            service: 'shipmonk',
            url: 'https://api.shipmonk.com',
            auth: {
                type: 'api-key',
                location: 'header',
                key: 'X-Api-Key',
                value: 'secret',
            },
            application_id: applicationId,
            vendor: null,
        })

        const responseBody: ServiceConnectionApiDTO = {
            id: '01970000-0000-7000-8000-000000000001',
            name: 'My connection',
            service: 'shipmonk',
            url: 'https://api.shipmonk.com',
            status: 'active',
            created_datetime: '2026-05-01T00:00:00',
            updated_datetime: null,
            trashed_datetime: null,
            created_by: 1,
            updated_by: null,
            trashed_by: null,
            external_id: null,
            vendor: null,
        }

        it('POSTs the payload and returns the created service connection', async () => {
            const payload = buildPayload()
            mockedServer.onPost('/api/service-connections/').reply((config) => {
                expect(JSON.parse(config.data)).toEqual(payload)
                return [200, responseBody]
            })

            const { result } = renderHook(
                () => useCreateServiceConnection(applicationId),
                { wrapper },
            )

            await act(async () => {
                const created = await result.current.mutateAsync(payload)
                expect(created).toEqual(responseBody)
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
        })

        it('invalidates the service connections list for the application on success', async () => {
            mockedServer
                .onPost('/api/service-connections/')
                .reply(200, responseBody)

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

            const { result } = renderHook(
                () => useCreateServiceConnection(applicationId),
                { wrapper },
            )

            await act(async () => {
                await result.current.mutateAsync(buildPayload())
            })

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: serviceConnectionsQueryKey(applicationId),
            })

            invalidateSpy.mockRestore()
        })

        it('calls the user-provided onSuccess after invalidating the cache', async () => {
            mockedServer
                .onPost('/api/service-connections/')
                .reply(200, responseBody)

            const onSuccess = jest.fn()
            const payload = buildPayload()

            const { result } = renderHook(
                () => useCreateServiceConnection(applicationId, { onSuccess }),
                { wrapper },
            )

            await act(async () => {
                await result.current.mutateAsync(payload)
            })

            expect(onSuccess).toHaveBeenCalledWith(
                responseBody,
                payload,
                undefined,
            )
        })

        it('surfaces errors from the API as a failed mutation', async () => {
            mockedServer
                .onPost('/api/service-connections/')
                .reply(500, { error: { msg: 'boom' } })

            const { result } = renderHook(
                () => useCreateServiceConnection(applicationId),
                { wrapper },
            )

            await expect(
                result.current.mutateAsync(buildPayload()),
            ).rejects.toBeDefined()

            await waitFor(() => expect(result.current.isError).toBe(true))
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

        beforeEach(() => {
            queryClient.clear()
        })

        it('fetch data', async () => {
            fetchShopifyCollectionsMock.mockResolvedValueOnce({
                collectionResponse,
            } as any)

            const { result } = renderHook(
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
            const { result } = renderHook(
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
