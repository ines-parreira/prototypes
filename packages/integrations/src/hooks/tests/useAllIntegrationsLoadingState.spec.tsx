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
import { useAllIntegrationsLoadingState } from '../useAllIntegrationsLoadingState'

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

// Render both hooks in one callback so they share the provider's QueryClient
// and the loading-state hook observes the same query the fetch hook starts.
const renderLoadingState = () =>
    renderHook(() => ({
        integrations: useAllIntegrations(),
        loadingState: useAllIntegrationsLoadingState(),
    }))

describe('useAllIntegrationsLoadingState', () => {
    it('reports loading until the integrations resolve', async () => {
        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json(
                mockListIntegrationsResponse({
                    data: [mockShopifyIntegration({ id: 1 })],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )

        server.use(mockListIntegrations.handler)

        const { result } = renderLoadingState()

        expect(result.current.loadingState).toEqual({
            isLoading: true,
            isError: false,
        })

        await waitFor(() => {
            expect(result.current.integrations).toHaveLength(1)
        })
        expect(result.current.loadingState).toEqual({
            isLoading: false,
            isError: false,
        })
    })

    it('reports an error when the request fails', async () => {
        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json(null, { status: 500 }),
        )

        server.use(mockListIntegrations.handler)

        const { result } = renderLoadingState()

        await waitFor(() => {
            expect(result.current.loadingState.isError).toBe(true)
        })
        expect(result.current.loadingState.isLoading).toBe(false)
    })
})
