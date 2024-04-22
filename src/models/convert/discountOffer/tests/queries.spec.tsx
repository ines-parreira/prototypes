import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {act} from '@testing-library/react'
import {assumeMock} from 'utils/testing'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {uniqueDiscountOffers} from 'fixtures/uniqueDiscountOffers'
import * as resources from '../resources'
import * as queries from '../queries'

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('../resources', () => ({
    createDiscountOffer: jest.fn(),
    getDiscountOffers: jest.fn(),
    updateDiscountOffer: jest.fn(),
    deleteDiscountOffer: jest.fn(),
}))

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const mockResources = {
    mockCreateDiscountOffer: assumeMock(resources.createDiscountOffer),
    mockGetDiscountOffers: assumeMock(resources.getDiscountOffers),
    mockUpdateDiscountOffer: assumeMock(resources.updateDiscountOffer),
    mockDeleteDiscountOffer: assumeMock(resources.deleteDiscountOffer),
}

const testOverrides = {
    staleTime: 0,
    cacheTime: 0,
    retry: 0,
}

describe('Discount Offer queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('getDiscountOffers', () => {
        it('should return correct data on success', async () => {
            const mockParams = {
                store_integration_id: '3',
                search: '',
            }

            mockResources.mockGetDiscountOffers.mockResolvedValueOnce(
                axiosSuccessResponse([uniqueDiscountOffers]) as any
            )
            const {result, waitFor} = renderHook(
                () => queries.useListDiscountOffers(mockParams, testOverrides),
                {
                    wrapper,
                }
            )
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
                expect(result.current.data).toStrictEqual([
                    uniqueDiscountOffers,
                ])
            })
        })
        it('should throw error on failure', async () => {
            const mockParams = {
                store_integration_id: '3',
                search: '',
            }

            mockResources.mockGetDiscountOffers.mockRejectedValue(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () => queries.useListDiscountOffers(mockParams, testOverrides),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('deleteDiscountOffer', () => {
        it('should successfully delete', async () => {
            mockResources.mockDeleteDiscountOffer.mockResolvedValueOnce(
                axiosSuccessResponse(undefined) as any
            )
            const {result, waitFor} = renderHook(
                () => queries.useDeleteDiscountOffer(testOverrides),
                {
                    wrapper,
                }
            )

            act(() => {
                result.current.mutate([undefined, {discount_offer_id: '3'}])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toStrictEqual(undefined)
        })
        it('should throw error if delete fails', async () => {
            mockResources.mockDeleteDiscountOffer.mockRejectedValueOnce(
                Error('test')
            )
            const {result, waitFor} = renderHook(
                () => queries.useDeleteDiscountOffer(testOverrides),
                {
                    wrapper,
                }
            )

            act(() => {
                result.current.mutate([undefined, {discount_offer_id: '3'}])
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
            expect(result.current.error).toStrictEqual(Error('test'))
        })
    })
})
