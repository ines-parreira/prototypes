import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'
import type { MetafieldDefinition } from '@gorgias/helpdesk-types'

import {
    transformMetafieldDefinitionToField,
    useMetafieldDefinitions,
} from './useMetafieldDefinitions'

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
        isVisible: false,
    },
    {
        id: '3',
        name: 'Loyalty Points',
        type: 'number_integer',
        namespace: 'custom',
        key: 'loyalty_points',
        ownerType: 'Customer',
        isPinned: false,
        isVisible: undefined,
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

describe('useMetafieldDefinitions', () => {
    let queryClient: QueryClient
    const mockIntegrationId = 123

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
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

    describe('data transformation', () => {
        it('should transform MetafieldDefinition to Field type correctly', async () => {
            const { result } = renderHook(
                () =>
                    useMetafieldDefinitions({
                        integrationId: mockIntegrationId,
                        pinned: false,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.data).toHaveLength(3)
            expect(result.current.data[0]).toEqual({
                id: '1',
                name: 'Delivery type',
                type: 'single_line_text_field',
                category: 'Order',
                isVisible: true,
            })
        })
    })

    describe('query states', () => {
        it('should return loading state initially', () => {
            const { result } = renderHook(
                () =>
                    useMetafieldDefinitions({
                        integrationId: mockIntegrationId,
                        pinned: false,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.data).toEqual([])
        })

        it.each([
            { scenario: 'empty array', data: [] },
            { scenario: 'undefined', data: undefined },
            { scenario: 'null', data: null },
        ])(
            'should return empty array when response data is $scenario',
            async ({ data }) => {
                const { handler } = mockListMetafieldDefinitionsHandler(
                    async ({ data: responseData }) =>
                        HttpResponse.json({
                            ...responseData,
                            data: data as unknown as MetafieldDefinition[],
                        }),
                )
                server.use(handler)

                const { result } = renderHook(
                    () =>
                        useMetafieldDefinitions({
                            integrationId: mockIntegrationId,
                            pinned: false,
                        }),
                    { wrapper },
                )

                await waitFor(() => {
                    expect(result.current.isLoading).toBe(false)
                })

                expect(result.current.data).toEqual([])
            },
        )
    })
})

describe('transformMetafieldDefinitionToField', () => {
    it('should transform a MetafieldDefinition to Field correctly', () => {
        const definition: MetafieldDefinition = {
            id: '1',
            name: 'Test Field',
            type: 'single_line_text_field',
            namespace: 'custom',
            key: 'test',
            ownerType: 'Customer',
            isPinned: true,
            isVisible: true,
        }

        const result = transformMetafieldDefinitionToField(definition)

        expect(result).toEqual({
            id: '1',
            name: 'Test Field',
            type: 'single_line_text_field',
            category: 'Customer',
            isVisible: true,
        })
    })

    it('should map ownerType to category', () => {
        const definition: MetafieldDefinition = {
            id: '1',
            name: 'Test Field',
            type: 'number_integer',
            namespace: 'custom',
            key: 'test',
            ownerType: 'DraftOrder',
            isPinned: false,
            isVisible: true,
        }

        const result = transformMetafieldDefinitionToField(definition)

        expect(result.category).toBe('DraftOrder')
    })
})
