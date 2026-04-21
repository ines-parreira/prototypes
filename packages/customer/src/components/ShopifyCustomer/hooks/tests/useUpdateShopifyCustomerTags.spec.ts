import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockEcommerceData,
    mockGetEcommerceDataByExternalIdHandler,
} from '@gorgias/ecommerce-storage-mocks'
import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { server } from '../../../../tests/server'
import { useGetShopper } from '../useGetShopper'
import { useUpdateShopifyCustomerTags } from '../useUpdateShopifyCustomerTags'

const mockParams = {
    integrationId: 1,
    userId: '123',
    externalId: 'ext_456',
    tagsList: 'VIP, Wholesale',
}

const mockShopper = mockEcommerceData({
    external_id: mockParams.externalId,
    data: {
        tags: 'OldTag',
    },
})

function renderUpdateShopifyCustomerTags() {
    return renderHook(() => useUpdateShopifyCustomerTags())
}

function renderUpdateShopifyCustomerTagsWithShopper() {
    return renderHook(() => ({
        updateShopifyCustomerTags: useUpdateShopifyCustomerTags(),
        shopper: useGetShopper({
            integrationId: mockParams.integrationId,
            externalId: mockParams.externalId,
        }),
    }))
}

describe('useUpdateShopifyCustomerTags', () => {
    beforeEach(() => {
        const mockGetEcommerceData = mockGetEcommerceDataByExternalIdHandler(
            async () => HttpResponse.json(mockShopper),
        )

        server.use(mockGetEcommerceData.handler)
    })

    it('calls mutation with correct action body', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderUpdateShopifyCustomerTags()

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

        const { result } = renderUpdateShopifyCustomerTags()

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

        const { result } = renderUpdateShopifyCustomerTags()

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

        const { result } = renderUpdateShopifyCustomerTags()

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

        const { result } = renderUpdateShopifyCustomerTagsWithShopper()

        await waitFor(() => {
            expect(result.current.shopper.isLoadingShopper).toBe(false)
        })

        expect(result.current.shopper.shopper?.data.tags).toBe('OldTag')

        act(() => {
            result.current.updateShopifyCustomerTags.mutate(mockParams)
        })

        await waitFor(() => {
            expect(result.current.shopper.shopper?.data.tags).toBe(
                'VIP, Wholesale',
            )
        })
    })

    it('reverts cache on error', async () => {
        const errorHandler = http.post('/api/actions/execute', () =>
            HttpResponse.json({ error: 'Server error' }, { status: 500 }),
        )
        server.use(errorHandler)

        const { result } = renderUpdateShopifyCustomerTagsWithShopper()

        await waitFor(() => {
            expect(result.current.shopper.isLoadingShopper).toBe(false)
        })

        act(() => {
            result.current.updateShopifyCustomerTags.mutate(mockParams)
        })

        await waitFor(() => {
            expect(result.current.updateShopifyCustomerTags.isError).toBe(true)
        })

        await waitFor(() => {
            expect(result.current.shopper.shopper?.data.tags).toBe('OldTag')
        })
    })
})
