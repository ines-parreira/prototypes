import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'
import type { MetafieldDefinition } from '@gorgias/helpdesk-types'

import { useImportableMetafields } from './useImportableMetafields'

const mockMetafieldDefinitions: MetafieldDefinition[] = [
    {
        id: '1',
        name: 'Delivery type',
        type: 'single_line_text_field',
        namespace: 'custom',
        key: 'delivery_type',
        ownerType: 'Order',
        isPinned: false,
        isVisible: true,
    },
    {
        id: '2',
        name: 'VIP Customer',
        type: 'boolean',
        namespace: 'custom',
        key: 'vip',
        ownerType: 'Customer',
        isPinned: false,
        isVisible: true,
    },
]

const server = setupServer()

const mockListMetafieldDefinitions = mockListMetafieldDefinitionsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: mockMetafieldDefinitions,
        }),
)

describe('useImportableMetafields', () => {
    let queryClient: QueryClient
    const mockIntegrationId = '123'

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter
            initialEntries={[
                `/app/settings/store-management/${mockIntegrationId}/metafields`,
            ]}
        >
            <QueryClientProvider client={queryClient}>
                <Route path="/app/settings/store-management/:id/metafields">
                    {children}
                </Route>
            </QueryClientProvider>
        </MemoryRouter>
    )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        server.use(mockListMetafieldDefinitions.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    it('should return metafields data transformed to Field type', async () => {
        const { result } = renderHook(() => useImportableMetafields(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toHaveLength(2)
        expect(result.current.data).toEqual([
            {
                id: '1',
                name: 'Delivery type',
                type: 'single_line_text_field',
                category: 'Order',
                isVisible: true,
            },
            {
                id: '2',
                name: 'VIP Customer',
                type: 'boolean',
                category: 'Customer',
                isVisible: true,
            },
        ])
    })

    it('should return loading state initially', () => {
        const { result } = renderHook(() => useImportableMetafields(), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual([])
    })

    it('should return empty array when no data', async () => {
        const { handler } = mockListMetafieldDefinitionsHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                }),
        )
        server.use(handler)

        const { result } = renderHook(() => useImportableMetafields(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual([])
    })
})
