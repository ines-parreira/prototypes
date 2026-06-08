import { useExhaustEndpoint } from '@repo/hooks'
import { Duration } from '@gorgias/toolkit'

import { queryKeys, useListInstagramProfiles } from '@gorgias/helpdesk-queries'
import type { TicketCustomer, TicketMessage } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { useCustomerInstagramProfile } from '../useCustomerInstagramProfile'

vi.mock('@repo/hooks', () => ({
    useExhaustEndpoint: vi.fn(),
}))

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')
    return {
        ...actual,
        useListInstagramProfiles: vi.fn(),
    }
})

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
        vi.mocked(useListInstagramProfiles).mockReturnValue({
            data: undefined,
        } as ReturnType<typeof useListInstagramProfiles>)
    })

    it('uses one-day freshness and retention for Instagram profile queries', () => {
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
        expect(useListInstagramProfiles).toHaveBeenCalledWith(
            {
                customer_id: customer.id,
                owning_business_id: 'ig_business_123',
                limit: 1,
                order_by: 'updated_at:desc',
            },
            {
                query: {
                    enabled: true,
                    queryKey: queryKeys.integrations.listInstagramProfiles({
                        customer_id: customer.id,
                        owning_business_id: 'ig_business_123',
                        limit: 1,
                        order_by: 'updated_at:desc',
                    }),
                    staleTime: Duration.days(1),
                    cacheTime: Duration.days(1),
                    select: expect.any(Function),
                },
            },
        )
    })
})
