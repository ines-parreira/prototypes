import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBigcommerceIntegration,
    mockEmailIntegration,
    mockGetStoreMappingsByAccountIdHandler,
    mockGetStoreMappingsByAccountIdResponse,
    mockGorgiasChatIntegration,
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockMagento2Integration,
    mockShopifyIntegration,
    mockStoreMapping,
} from '@gorgias/helpdesk-mocks'

import { useAllStores } from '../useAllStores'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const storeMappingsHandler = (...storeIds: number[]) =>
    mockGetStoreMappingsByAccountIdHandler(async () =>
        HttpResponse.json(
            mockGetStoreMappingsByAccountIdResponse({
                data: storeIds.map((storeId, index) =>
                    mockStoreMapping({
                        store_id: storeId,
                        integration_id: 100 + index,
                    }),
                ),
            }),
        ),
    ).handler

describe('useAllStores', () => {
    it('returns the integrations whose ids are mapped as stores', async () => {
        server.use(
            mockListIntegrationsHandler(async () =>
                HttpResponse.json(
                    mockListIntegrationsResponse({
                        data: [
                            mockShopifyIntegration({ id: 1, name: 'Shopify' }),
                            mockEmailIntegration({ id: 2, name: 'Inbox' }),
                            mockBigcommerceIntegration({ id: 3, name: 'BC' }),
                            mockGorgiasChatIntegration({ id: 4, name: 'Chat' }),
                            mockMagento2Integration({ id: 5, name: 'Magento' }),
                        ],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
            // Magento2 (id 5) is a store-type integration but is NOT mapped,
            // so it must not appear: the store set comes from the mappings.
            storeMappingsHandler(1, 3),
        )

        const { result } = renderHook(() => useAllStores())

        await waitFor(() => {
            expect(result.current).toHaveLength(2)
        })
        expect(result.current.map((store) => store.id)).toEqual([1, 3])
        expect(result.current.map((store) => store.type)).toEqual([
            'shopify',
            'bigcommerce',
        ])
    })

    it('resolves mapped stores across exhausted integration pages', async () => {
        server.use(
            mockListIntegrationsHandler(async ({ request }) => {
                const cursor = new URL(request.url).searchParams.get('cursor')

                if (!cursor) {
                    return HttpResponse.json(
                        mockListIntegrationsResponse({
                            data: [
                                mockShopifyIntegration({ id: 1 }),
                                mockEmailIntegration({ id: 2 }),
                            ],
                            meta: {
                                prev_cursor: null,
                                next_cursor: 'cursor-page-2',
                            },
                        }),
                    )
                }

                return HttpResponse.json(
                    mockListIntegrationsResponse({
                        data: [mockBigcommerceIntegration({ id: 3 })],
                        meta: {
                            prev_cursor: 'cursor-page-1',
                            next_cursor: null,
                        },
                    }),
                )
            }).handler,
            storeMappingsHandler(1, 3),
        )

        const { result } = renderHook(() => useAllStores())

        await waitFor(() => {
            expect(result.current).toHaveLength(2)
        })
        expect(result.current.map((store) => store.id)).toEqual([1, 3])
    })

    it('returns an empty array while the queries are still loading', () => {
        server.use(
            mockListIntegrationsHandler(async () =>
                HttpResponse.json(
                    mockListIntegrationsResponse({
                        data: [mockShopifyIntegration({ id: 1 })],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
            storeMappingsHandler(1),
        )

        const { result } = renderHook(() => useAllStores())

        expect(result.current).toEqual([])
    })
})
