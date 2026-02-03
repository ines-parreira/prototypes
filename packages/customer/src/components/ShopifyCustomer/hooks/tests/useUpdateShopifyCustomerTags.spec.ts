import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    ObjectType,
    queryKeys,
    SourceType,
} from '@gorgias/ecommerce-storage-queries'
import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useUpdateShopifyCustomerTags } from '../useUpdateShopifyCustomerTags'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const mockParams = {
    integrationId: 1,
    userId: '123',
    externalId: 'ext_456',
    tagsList: 'VIP, Wholesale',
}

describe('useUpdateShopifyCustomerTags', () => {
    it('calls mutation with correct action body', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('shopifyUpdateCustomerTags')
            expect(body.user_id).toBe('123')
            expect(body.integration_id).toBe('1')
            expect(body.payload.tags_list).toBe('VIP, Wholesale')
        })
    })

    it('generates action_id from params', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_id).toBeDefined()
            expect(body.action_id).toContain('shopifyUpdateCustomerTags')
            expect(body.action_id).toContain('123')
            expect(body.action_id).toContain('1')
        })
    })

    it('includes ticketId when provided', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate({
                ...mockParams,
                ticketId: 'ticket_789',
            })
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.ticket_id).toBe('ticket_789')
        })
    })

    it('excludes ticketId when not provided', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.ticket_id).toBeUndefined()
        })
    })

    it('performs optimistic update on cache', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const queryKey = queryKeys.ecommerceData.getEcommerceDataByExternalId(
            ObjectType.Shopper,
            SourceType.Shopify,
            '1',
            'ext_456',
        )

        const initialData = {
            data: {
                data: {
                    tags: 'OldTag',
                },
            },
        }

        testAppQueryClient.setQueryData(queryKey, initialData)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitFor(() => {
            const cachedData = testAppQueryClient.getQueryData(queryKey) as {
                data: { data: { tags: string } }
            }
            expect(cachedData.data.data.tags).toBe('VIP, Wholesale')
        })
    })

    it('reverts cache on error', async () => {
        const errorHandler = http.post('/api/actions/execute', () =>
            HttpResponse.json({ error: 'Server error' }, { status: 500 }),
        )
        server.use(errorHandler)

        const queryKey = queryKeys.ecommerceData.getEcommerceDataByExternalId(
            ObjectType.Shopper,
            SourceType.Shopify,
            '1',
            'ext_456',
        )

        const initialData = {
            data: {
                data: {
                    tags: 'OldTag',
                },
            },
        }

        testAppQueryClient.setQueryData(queryKey, initialData)

        const { result } = renderHook(() => useUpdateShopifyCustomerTags())

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        const cachedData = testAppQueryClient.getQueryData(queryKey) as {
            data: { data: { tags: string } }
        }
        expect(cachedData.data.data.tags).toBe('OldTag')
    })
})
