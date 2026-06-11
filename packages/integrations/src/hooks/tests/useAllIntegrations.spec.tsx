import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockShopifyIntegration,
} from '@gorgias/helpdesk-mocks'

import { useAllIntegrations } from '../useAllIntegrations'

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

describe('useAllIntegrations', () => {
    it('fetches all integrations in a single page', async () => {
        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json(
                mockListIntegrationsResponse({
                    data: [mockShopifyIntegration({ id: 1, name: 'Store 1' })],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )
        const waitForListIntegrationsRequest =
            mockListIntegrations.waitForRequest(server)

        server.use(mockListIntegrations.handler)

        const { result } = renderHook(() => useAllIntegrations())

        await waitForListIntegrationsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current).toHaveLength(1)
        })
        expect(result.current[0]?.id).toBe(1)
    })

    it('exhausts all pages when multiple cursor pages exist', async () => {
        const mockListIntegrations = mockListIntegrationsHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                const cursor = url.searchParams.get('cursor')

                if (!cursor) {
                    return HttpResponse.json(
                        mockListIntegrationsResponse({
                            data: [
                                mockShopifyIntegration({ id: 1, name: 'One' }),
                                mockShopifyIntegration({ id: 2, name: 'Two' }),
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
                        data: [
                            mockShopifyIntegration({ id: 3, name: 'Three' }),
                        ],
                        meta: {
                            prev_cursor: 'cursor-page-1',
                            next_cursor: null,
                        },
                    }),
                )
            },
        )

        server.use(mockListIntegrations.handler)

        const { result } = renderHook(() => useAllIntegrations())

        await waitFor(() => {
            expect(result.current).toHaveLength(3)
        })
        expect(result.current.map((integration) => integration.id)).toEqual([
            1, 2, 3,
        ])
    })

    it('returns an empty array while the first page is still loading', () => {
        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json(
                mockListIntegrationsResponse({
                    data: [mockShopifyIntegration({ id: 1 })],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )

        server.use(mockListIntegrations.handler)

        const { result } = renderHook(() => useAllIntegrations())

        expect(result.current).toEqual([])
    })
})
