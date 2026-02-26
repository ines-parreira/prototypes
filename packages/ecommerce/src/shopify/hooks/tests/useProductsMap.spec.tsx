import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEcommerceData,
    mockListEcommerceDataHandler,
    mockPaginatedDataEcommerceData,
} from '@gorgias/ecommerce-storage-mocks'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { useProductsMap } from '../useProductsMap'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})
afterAll(() => server.close())

const createProduct = (externalId: string, withImage = false) =>
    mockEcommerceData({
        external_id: externalId,
        data: {
            title: `Product ${externalId}`,
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

const createGraphQLProduct = (externalId: string, withImage = false) =>
    mockEcommerceData({
        external_id: externalId,
        data: {
            title: `GraphQL Product ${externalId}`,
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

describe('useProductsMap', () => {
    it('returns loading state initially', () => {
        setupHandler([createProduct('101', true)])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101'],
            }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.productsMap.size).toBe(0)
    })

    it('returns products map with correct data', async () => {
        setupHandler([createProduct('101', true)])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101'],
            }),
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

    it('handles products without images', async () => {
        setupHandler([createProduct('101')])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101'],
            }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.get(101)).toEqual({
            image: null,
            images: [],
        })
    })

    it('handles multiple products', async () => {
        setupHandler([createProduct('101', true), createProduct('102')])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101', '102'],
            }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(2)
        expect(result.current.productsMap.get(101)?.image).not.toBeNull()
        expect(result.current.productsMap.get(102)?.image).toBeNull()
    })

    it('skips products with invalid external_id', async () => {
        setupHandler([createProduct('101'), createProduct('invalid')])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101'],
            }),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.productsMap.size).toBe(1)
        expect(result.current.productsMap.has(101)).toBe(true)
    })

    it('handles GraphQL schema format', async () => {
        setupHandler([createGraphQLProduct('101', true)])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101'],
            }),
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
            ],
        })
    })

    it('handles mixed REST and GraphQL products', async () => {
        setupHandler([
            createProduct('101', true),
            createGraphQLProduct('102', true),
        ])

        const { result } = renderHook(() =>
            useProductsMap({
                integrationId: 1,
                productExternalIds: ['101', '102'],
            }),
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

    it('sends correct request params', async () => {
        const handler = setupHandler([createProduct('101')])

        const waitForRequest = handler.waitForRequest(server)
        renderHook(() =>
            useProductsMap({
                integrationId: 42,
                productExternalIds: ['101', '102'],
            }),
        )

        await waitForRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('integration_id')).toBe('42')
            expect(url.searchParams.getAll('external_ids')).toEqual(
                expect.arrayContaining(['101', '102']),
            )
        })
    })

    it.each([
        [
            'integrationId is undefined',
            { integrationId: undefined, productExternalIds: ['101'] },
        ],
        [
            'productExternalIds is empty',
            { integrationId: 1, productExternalIds: [] },
        ],
    ])('does not fetch when %s', async (_, params) => {
        let requestMade = false
        setupHandler([], () => {
            requestMade = true
        })

        const { result } = renderHook(() => useProductsMap(params))

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.productsMap.size).toBe(0)
    })
})
