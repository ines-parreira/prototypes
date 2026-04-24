import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockEcommerceData,
    mockListEcommerceDataHandler,
    mockPaginatedDataEcommerceData,
} from '@gorgias/ecommerce-storage-mocks'
import { ObjectType } from '@gorgias/ecommerce-storage-queries'
import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { server } from '../../../../tests/server'
import { useListShopifyOrders } from '../useListShopifyOrders'
import { useUpdateShopifyOrderNote } from '../useUpdateShopifyOrderNote'

const SHOPPER_IDENTITY_ID = '01956de4-e1ff-7523-ac68-a00ca2dd6e3f'

const mockParams = {
    integrationId: 1,
    orderId: 12345,
    note: 'Updated note',
}

const mockOrder = mockEcommerceData({
    external_id: 'order-1',
    data: {
        id: 12345,
        note: 'Original note',
    },
    relationships: {
        shopper_identity: SHOPPER_IDENTITY_ID,
    },
})

function renderUpdateShopifyOrderNote() {
    return renderHook(() => useUpdateShopifyOrderNote())
}

function renderUpdateShopifyOrderNoteWithOrders() {
    return renderHook(() => ({
        updateNote: useUpdateShopifyOrderNote(),
        orders: useListShopifyOrders({
            integrationId: mockParams.integrationId,
            shopperIdentityId: SHOPPER_IDENTITY_ID,
            objectType: ObjectType.Order,
        }),
    }))
}

describe('useUpdateShopifyOrderNote', () => {
    beforeEach(() => {
        const mockListOrders = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [mockOrder],
                }),
            ),
        )
        server.use(mockListOrders.handler)
    })

    it('calls mutation with correct action body', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderUpdateShopifyOrderNote()

        act(() => {
            result.current.mutate(mockParams)
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('shopifyEditNoteOfOrder')
            expect(body.integration_id).toBe(mockParams.integrationId)
            expect(body.payload.note).toBe('Updated note')
            expect(body.payload.order_id).toBe(12345)
        })
    })

    it('includes ticketId when provided', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderUpdateShopifyOrderNote()

        act(() => {
            result.current.mutate({
                ...mockParams,
                ticketId: '789',
            })
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.ticket_id).toBe(789)
        })
    })

    it('excludes ticketId when not provided', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForRequest = executeActionMock.waitForRequest(server)

        const { result } = renderUpdateShopifyOrderNote()

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

        const { result } = renderUpdateShopifyOrderNoteWithOrders()

        await waitFor(() => {
            expect(result.current.orders.isLoadingOrders).toBe(false)
        })

        expect(result.current.orders.orders?.[0]?.data.note).toBe(
            'Original note',
        )

        act(() => {
            result.current.updateNote.mutate(mockParams)
        })

        await waitFor(() => {
            expect(result.current.orders.orders?.[0]?.data.note).toBe(
                'Updated note',
            )
        })
    })

    it('reverts cache on error', async () => {
        const errorHandler = http.post('/api/actions/execute', () =>
            HttpResponse.json({ error: 'Server error' }, { status: 500 }),
        )
        server.use(errorHandler)

        const { result } = renderUpdateShopifyOrderNoteWithOrders()

        await waitFor(() => {
            expect(result.current.orders.isLoadingOrders).toBe(false)
        })

        act(() => {
            result.current.updateNote.mutate(mockParams)
        })

        await waitFor(() => {
            expect(result.current.updateNote.isError).toBe(true)
        })

        await waitFor(() => {
            expect(result.current.orders.orders?.[0]?.data.note).toBe(
                'Original note',
            )
        })
    })
})
