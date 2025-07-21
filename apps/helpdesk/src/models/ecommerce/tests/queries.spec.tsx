import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { AxiosResponse } from 'axios'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { useGetEcommerceItemByExternalId } from '../queries'
import * as resources from '../resources'
import { mockEcommerceData, mockEcommerceItem } from './mocks'

const fetchEcommerceItemByExternalId = jest.spyOn(
    resources,
    'fetchEcommerceItemByExternalId',
)

const queryClient = mockQueryClient()

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Ecommerce Queries', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    describe('useGetEcommerceItemByExternalId', () => {
        it('should fetch ecommerce item by external ID', async () => {
            fetchEcommerceItemByExternalId.mockResolvedValueOnce(
                mockEcommerceData as AxiosResponse,
            )

            const { result } = renderHook(
                () =>
                    useGetEcommerceItemByExternalId(
                        'product',
                        'shopify',
                        123,
                        'ext-456',
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockEcommerceItem)
            expect(fetchEcommerceItemByExternalId).toHaveBeenCalledWith(
                'product',
                'shopify',
                123,
                'ext-456',
            )
        })

        it('should not call the api function when enabled false', () => {
            fetchEcommerceItemByExternalId.mockResolvedValueOnce(
                mockEcommerceData as AxiosResponse,
            )

            const { result } = renderHook(
                () =>
                    useGetEcommerceItemByExternalId(
                        'product',
                        'shopify',
                        123,
                        'ext-456',
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            expect(fetchEcommerceItemByExternalId).toHaveBeenCalledTimes(0)
        })
    })
})
