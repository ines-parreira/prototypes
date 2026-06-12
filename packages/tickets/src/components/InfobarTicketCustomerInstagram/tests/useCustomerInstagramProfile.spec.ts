import { HttpResponse } from 'msw'
import { Duration } from '@gorgias/toolkit'
import { useExhaustEndpoint } from '@gorgias/toolkit-react'

import {
    mockListInstagramProfilesHandler,
    mockListInstagramProfilesResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { TicketCustomer, TicketMessage } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useCustomerInstagramProfile } from '../useCustomerInstagramProfile'

vi.mock('@gorgias/toolkit-react', () => ({
    useExhaustEndpoint: vi.fn(),
}))

const customer = {
    id: 1,
} as TicketCustomer

const messages = [
    {
        id: 1,
        integration_id: 123,
    },
] as TicketMessage[]

describe('useCustomerInstagramProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useExhaustEndpoint).mockReturnValue({
            data: [
                {
                    id: 123,
                    meta: {
                        instagram: {
                            id: 'ig_business_123',
                        },
                    },
                },
            ],
        } as ReturnType<typeof useExhaustEndpoint>)
    })

    it('uses one-day freshness and retention for Instagram profile queries', async () => {
        const listInstagramProfilesMock = mockListInstagramProfilesHandler(
            async () =>
                HttpResponse.json(
                    mockListInstagramProfilesResponse({ data: [] }),
                ),
        )
        const waitForListInstagramProfilesRequest =
            listInstagramProfilesMock.waitForRequest(server)
        server.use(listInstagramProfilesMock.handler)

        renderHook(() => useCustomerInstagramProfile({ customer, messages }))

        expect(useExhaustEndpoint).toHaveBeenCalledWith(
            queryKeys.integrations.listIntegrations({ limit: 100 }),
            expect.any(Function),
            {
                staleTime: Duration.days(1),
                cacheTime: Duration.days(1),
                refetchOnWindowFocus: false,
            },
        )
        await waitForListInstagramProfilesRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('customer_id')).toBe(String(customer.id))
            expect(searchParams.get('owning_business_id')).toBe(
                'ig_business_123',
            )
            expect(searchParams.get('limit')).toBe('1')
            expect(searchParams.get('order_by')).toBe('updated_at:desc')
        })
    })
})
