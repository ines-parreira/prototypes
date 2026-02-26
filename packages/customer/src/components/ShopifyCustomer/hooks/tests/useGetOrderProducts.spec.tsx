import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEcommerceData,
    mockListEcommerceDataHandler,
    mockPaginatedDataEcommerceData,
} from '@gorgias/ecommerce-storage-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import type { OrderEcommerceData, OrderLineItem } from '../../types'
import { useGetOrderProducts } from '../useGetOrderProducts'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})
afterAll(() => server.close())

const createOrder = (
    id: string,
    lineItems: OrderLineItem[],
): OrderEcommerceData => ({
    id: `uuid-${id}`,
    account_id: 1,
    created_datetime: '2024-01-15T10:00:00Z',
    updated_datetime: '2024-01-15T10:00:00Z',
    data: {
        id: 1,
        order_number: 1001,
        name: '#1001',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        currency: 'USD',
        total_price: '50.00',
        financial_status: 'paid',
        fulfillment_status: null,
        line_items: lineItems,
        customer: {} as OrderEcommerceData['data']['customer'],
    },
    source_type: 'shopify',
    integration_id: 1,
    external_id: id,
})

const createLineItem = (
    productId: number | null,
    productExists?: boolean,
): OrderLineItem => ({
    id: 1,
    title: 'Product',
    quantity: 1,
    price: '25.00',
    product_id: productId,
    variant_id: 201,
    product_exists: productExists,
})

const createProduct = (externalId: string, title: string, withImage = false) =>
    mockEcommerceData({
        external_id: externalId,
        data: {
            title,
            image: withImage
                ? {
                      src: 'https://example.com/img.jpg',
                      alt: 'Alt',
                      variant_ids: [201],
                  }
                : null,
            images: withImage
                ? [
                      {
                          src: 'https://example.com/img.jpg',
                          alt: 'Alt',
                          variant_ids: [201],
                      },
                  ]
                : [],
        },
    })

const createGraphQLProduct = (
    externalId: string,
    title: string,
    withImage = false,
) =>
    mockEcommerceData({
        external_id: externalId,
        data: {
            title,
            featuredMedia: withImage
                ? {
                      image: {
                          url: 'https://example.com/graphql-img.jpg',
                          altText: 'GraphQL Alt',
                      },
                  }
                : null,
            media: withImage
                ? {
                      nodes: [
                          {
                              image: {
                                  url: 'https://example.com/graphql-img.jpg',
                                  altText: 'GraphQL Alt',
                              },
                          },
                          {
                              image: {
                                  url: 'https://example.com/graphql-img2.jpg',
                                  altText: 'GraphQL Alt 2',
                              },
                          },
                      ],
                  }
                : { nodes: [] },
        },
    })

const setupHandler = (
    products: ReturnType<typeof createProduct>[],
    onRequest?: () => void,
) => {
    const mockHandler = mockListEcommerceDataHandler(async () => {
        onRequest?.()
        return HttpResponse.json(
            mockPaginatedDataEcommerceData({ data: products }),
        )
    })
    server.use(mockHandler.handler)
    return mockHandler
}

describe('useGetOrderProducts', () => {
    it('returns loading state initially', () => {
        setupHandler([createProduct('101', 'Test')])
        const orders = [createOrder('order-1', [createLineItem(101, true)])]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.productsMap.size).toBe(0)
    })

    it('returns products map with correct data structure', async () => {
        setupHandler([createProduct('101', 'Test Product', true)])
        const orders = [createOrder('order-1', [createLineItem(101, true)])]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.get(101)).toEqual({
            image: {
                alt: 'Alt',
                src: 'https://example.com/img.jpg',
                variant_ids: [201],
            },
            images: [
                {
                    alt: 'Alt',
                    src: 'https://example.com/img.jpg',
                    variant_ids: [201],
                },
            ],
        })
    })

    it('extracts unique product IDs and handles products without images', async () => {
        const handler = setupHandler([
            createProduct('101', 'Product A'),
            createProduct('102', 'Product B'),
        ])
        const orders = [
            createOrder('order-1', [
                createLineItem(101, true),
                createLineItem(101, true),
            ]),
            createOrder('order-2', [createLineItem(102, true)]),
        ]

        const waitForRequest = handler.waitForRequest(server)
        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitForRequest(async (request) => {
            const externalIds = new URL(request.url).searchParams.getAll(
                'external_ids',
            )
            expect(externalIds).toEqual(expect.arrayContaining(['101', '102']))
            expect(externalIds).toHaveLength(2)
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(2)
        expect(result.current.productsMap.get(101)?.image).toBeNull()
    })

    it.each([
        [
            'integrationId is undefined',
            {
                integrationId: undefined,
                orders: [createOrder('o', [createLineItem(101, true)])],
            },
        ],
        ['orders is undefined', { integrationId: 1, orders: undefined }],
        ['orders is empty', { integrationId: 1, orders: [] }],
        [
            'no valid product IDs',
            {
                integrationId: 1,
                orders: [
                    createOrder('o', [
                        createLineItem(null, true),
                        createLineItem(102, false),
                    ]),
                ],
            },
        ],
    ])('does not fetch when %s', async (_, params) => {
        let requestMade = false
        setupHandler([], () => {
            requestMade = true
        })

        const { result } = renderHook(() =>
            useGetOrderProducts(
                params as Parameters<typeof useGetOrderProducts>[0],
            ),
        )

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.productsMap.size).toBe(0)
    })

    it('skips products with invalid external_id', async () => {
        setupHandler([
            createProduct('101', 'Valid'),
            createProduct('invalid', 'Invalid'),
        ])
        const orders = [createOrder('order-1', [createLineItem(101, true)])]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(1)
        expect(result.current.productsMap.has(101)).toBe(true)
    })

    it('fetches products when product_exists is undefined (draft orders)', async () => {
        setupHandler([createProduct('101', 'Draft Order Product', true)])
        const orders = [
            createOrder('order-1', [createLineItem(101, undefined)]),
        ]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(1)
        expect(result.current.productsMap.has(101)).toBe(true)
    })

    it('handles GraphQL schema format with featuredMedia and media', async () => {
        setupHandler([createGraphQLProduct('101', 'GraphQL Product', true)])
        const orders = [createOrder('order-1', [createLineItem(101, true)])]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.get(101)).toEqual({
            image: {
                alt: 'GraphQL Alt',
                src: 'https://example.com/graphql-img.jpg',
                variant_ids: [],
            },
            images: [
                {
                    alt: 'GraphQL Alt',
                    src: 'https://example.com/graphql-img.jpg',
                    variant_ids: [],
                },
                {
                    alt: 'GraphQL Alt 2',
                    src: 'https://example.com/graphql-img2.jpg',
                    variant_ids: [],
                },
            ],
        })
    })

    it('handles GraphQL schema format without images', async () => {
        setupHandler([
            createGraphQLProduct('101', 'GraphQL Product No Image', false),
        ])
        const orders = [createOrder('order-1', [createLineItem(101, true)])]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.get(101)).toEqual({
            image: null,
            images: [],
        })
    })

    it('handles mixed REST and GraphQL schema products', async () => {
        setupHandler([
            createProduct('101', 'REST Product', true),
            createGraphQLProduct('102', 'GraphQL Product', true),
        ])
        const orders = [
            createOrder('order-1', [
                createLineItem(101, true),
                createLineItem(102, true),
            ]),
        ]

        const { result } = renderHook(() =>
            useGetOrderProducts({ integrationId: 1, orders }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(2)

        expect(result.current.productsMap.get(101)?.image?.src).toBe(
            'https://example.com/img.jpg',
        )
        expect(result.current.productsMap.get(102)?.image?.src).toBe(
            'https://example.com/graphql-img.jpg',
        )
    })
})
