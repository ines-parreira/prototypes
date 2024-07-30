import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {fetchShopifyCollections} from 'models/integration/resources/shopify'
import {useCollectionsFromShopifyIntegration} from 'models/integration/queries'
import {ShopifyCollectionResponse} from 'models/integration/types'

jest.mock('models/integration/resources/shopify', () => ({
    fetchShopifyCollections: jest.fn(),
}))

const fetchShopifyCollectionsMock = assumeMock(fetchShopifyCollections)

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('queries', () => {
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

            const {result, waitFor} = renderHook(
                () => useCollectionsFromShopifyIntegration(1),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual({
                collectionResponse: collectionResponse,
            })
        })

        it('should reject an error on fail', async () => {
            fetchShopifyCollectionsMock.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () => useCollectionsFromShopifyIntegration(1),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(fetchShopifyCollectionsMock).toBeCalled()
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
