import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import type { AxiosResponse } from 'axios'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useGetEcommerceItemByExternalId,
    useGetEcommerceLookupValues,
    useGetEcommerceProductCollections,
    useGetEcommerceProducts,
    useUpdateProductAdditionalInfo,
} from '../queries'
import * as resources from '../resources'
import {
    AdditionalInfoKey,
    AdditionalInfoObjectType,
    AdditionalInfoSourceType,
} from '../types'
import {
    mockEcommerceData,
    mockEcommerceItem,
    mockEcommerceProductTags,
    mockEcommerceVendors,
    mockProductCollections,
} from './mocks'

const fetchEcommerceItemByExternalId = jest.spyOn(
    resources,
    'fetchEcommerceItemByExternalId',
)

const fetchEcommerceLookupValues = jest.spyOn(
    resources,
    'fetchEcommerceLookupValues',
)

const fetchEcommerceProducts = jest.spyOn(resources, 'fetchEcommerceProducts')
const fetchEcommerceProductCollections = jest.spyOn(
    resources,
    'fetchEcommerceProductCollections',
)
const updateProductAdditionalInfo = jest.spyOn(
    resources,
    'updateProductAdditionalInfo',
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
            fetchEcommerceLookupValues.mockResolvedValueOnce({
                data: {
                    data: mockEcommerceProductTags,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceLookupValues('product_tag', 123),
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
            expect(fetchEcommerceLookupValues).toHaveBeenCalledWith(
                'product_tag',
                123,
                {},
            )
        })

        it('should fetch ecommerce vendors', async () => {
            fetchEcommerceLookupValues.mockResolvedValueOnce({
                data: {
                    data: mockEcommerceVendors,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceLookupValues('vendor', 123),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual({
                data: mockEcommerceVendors,
                metadata: {
                    next_cursor: 'next-cursor',
                    prev_cursor: 'prev-cursor',
                },
            })
            expect(fetchEcommerceLookupValues).toHaveBeenCalledWith(
                'vendor',
                123,
                {},
            )
        })

        it('should not call the api function when enabled false', () => {
            fetchEcommerceLookupValues.mockResolvedValueOnce({
                data: {
                    data: mockEcommerceVendors,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () =>
                    useGetEcommerceLookupValues(
                        'vendor',
                        123,
                        {},
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(fetchEcommerceItemByExternalId).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetEcommerceProducts', () => {
        it('should fetch ecommerce products', async () => {
            fetchEcommerceProducts.mockResolvedValueOnce({
                data: {
                    data: [
                        mockEcommerceItem,
                        mockEcommerceItem,
                        mockEcommerceItem,
                    ],
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(() => useGetEcommerceProducts(123), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual({
                data: [mockEcommerceItem, mockEcommerceItem, mockEcommerceItem],
                metadata: {
                    next_cursor: 'next-cursor',
                    prev_cursor: 'prev-cursor',
                },
            })
            expect(fetchEcommerceProducts).toHaveBeenCalledWith(123, {})
        })

        it('should not call the api function when enabled false', () => {
            fetchEcommerceProducts.mockResolvedValueOnce({
                data: {
                    data: [
                        mockEcommerceItem,
                        mockEcommerceItem,
                        mockEcommerceItem,
                    ],
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceProducts(123, {}, { enabled: false }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(fetchEcommerceProducts).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetEcommerceProductCollections', () => {
        it('should fetch ecommerce product collections', async () => {
            fetchEcommerceProductCollections.mockResolvedValueOnce({
                data: {
                    data: mockProductCollections,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () => useGetEcommerceProductCollections(123),
                {
                    wrapper,
                },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual({
                data: mockProductCollections,
                metadata: {
                    next_cursor: 'next-cursor',
                    prev_cursor: 'prev-cursor',
                },
            })
            expect(fetchEcommerceProductCollections).toHaveBeenCalledWith(
                123,
                {},
            )
        })

        it('should not call the api function when enabled false', () => {
            fetchEcommerceProductCollections.mockResolvedValueOnce({
                data: {
                    data: mockProductCollections,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                },
            } as AxiosResponse)

            const { result } = renderHook(
                () =>
                    useGetEcommerceProductCollections(
                        123,
                        {},
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(fetchEcommerceProductCollections).toHaveBeenCalledTimes(0)
        })
    })

    describe('useUpdateProductAdditionalInfo', () => {
        it('should update product additional info', async () => {
            const mockResponse = {
                data: {
                    rich_text: '<p>Updated additional info</p>',
                },
            }

            updateProductAdditionalInfo.mockResolvedValueOnce(
                mockResponse as AxiosResponse,
            )

            const { result } = renderHook(
                () => useUpdateProductAdditionalInfo(),
                { wrapper },
            )

            const params = {
                objectType: AdditionalInfoObjectType.PRODUCT,
                sourceType: AdditionalInfoSourceType.SHOPIFY,
                integrationId: 123,
                externalId: 'ext-456',
                key: AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT,
                data: {
                    data: {
                        rich_text: '<p>Updated additional info</p>',
                    },
                    version: new Date().toISOString(),
                },
            }

            await result.current.mutateAsync(params)

            expect(updateProductAdditionalInfo).toHaveBeenCalledWith(
                'product',
                'shopify',
                123,
                'ext-456',
                'ai_agent_extended_context',
                {
                    data: {
                        rich_text: '<p>Updated additional info</p>',
                    },
                    version: expect.any(String),
                },
            )
        })

        it('should handle errors when updating product additional info', async () => {
            const mockError = new Error('Update failed')
            updateProductAdditionalInfo.mockRejectedValueOnce(mockError)

            const { result } = renderHook(
                () => useUpdateProductAdditionalInfo(),
                { wrapper },
            )

            const params = {
                objectType: AdditionalInfoObjectType.PRODUCT,
                sourceType: AdditionalInfoSourceType.SHOPIFY,
                integrationId: 123,
                externalId: 'ext-456',
                key: AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT,
                data: {
                    data: {
                        rich_text: '<p>Updated additional info</p>',
                    },
                    version: new Date().toISOString(),
                },
            }

            await expect(result.current.mutateAsync(params)).rejects.toThrow(
                'Update failed',
            )
        })

        it('should accept custom mutation options', async () => {
            const mockResponse = {
                data: {
                    rich_text: '<p>Updated additional info</p>',
                },
            }
            const onSuccessMock = jest.fn()

            updateProductAdditionalInfo.mockResolvedValueOnce(
                mockResponse as AxiosResponse,
            )

            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfo({
                        onSuccess: onSuccessMock,
                    }),
                { wrapper },
            )

            const params = {
                objectType: AdditionalInfoObjectType.PRODUCT,
                sourceType: AdditionalInfoSourceType.SHOPIFY,
                integrationId: 123,
                externalId: 'ext-456',
                key: AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT,
                data: {
                    data: {
                        rich_text: '<p>Updated additional info</p>',
                    },
                    version: new Date().toISOString(),
                },
            }

            await result.current.mutateAsync(params)

            await waitFor(() => {
                expect(onSuccessMock).toHaveBeenCalledWith(
                    mockResponse,
                    params,
                    undefined,
                )
            })
        })
    })
})
