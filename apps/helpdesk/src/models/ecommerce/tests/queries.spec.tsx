import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { AxiosResponse } from 'axios'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useGetEcommerceItemByExternalId,
    useGetEcommerceProductTags,
} from '../queries'
import * as resources from '../resources'
import {
    mockEcommerceData,
    mockEcommerceItem,
    mockEcommerceProductTags,
} from './mocks'

const fetchEcommerceItemByExternalId = jest.spyOn(
    resources,
    'fetchEcommerceItemByExternalId',
)

const fetchEcommerceProductTags = jest.spyOn(
    resources,
    'fetchEcommerceProductTags',
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

    describe('useGetEcommerceProductTags', () => {
        it('should fetch ecommerce product tags', async () => {
            fetchEcommerceProductTags.mockResolvedValueOnce({
                data: {
                    data: mockEcommerceProductTags,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceProductTags(123),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual({
                data: mockEcommerceProductTags,
                metadata: {
                    next_cursor: 'next-cursor',
                    prev_cursor: 'prev-cursor',
                },
            })
            expect(fetchEcommerceProductTags).toHaveBeenCalledWith(123, {})
        })

        it('should not call the api function when enabled false', () => {
            fetchEcommerceProductTags.mockResolvedValueOnce({
                data: {
                    data: mockEcommerceProductTags,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceProductTags(123, {}, { enabled: false }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(fetchEcommerceItemByExternalId).toHaveBeenCalledTimes(0)
        })
    })
})
