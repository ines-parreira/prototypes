import { renderHook } from '@testing-library/react'

import { DurationInMs } from '@repo/utils'

import { useGetCustomer as useGeneratedGetCustomer } from '@gorgias/helpdesk-queries'

import { GET_CUSTOMER_STALE_TIME_MS, useGetCustomer } from '../useGetCustomer'

vi.mock('@gorgias/helpdesk-queries', () => ({
    useGetCustomer: vi.fn(() => ({
        data: null,
    })),
}))

const mockUseGeneratedGetCustomer = vi.mocked(useGeneratedGetCustomer)

describe('useGetCustomer', () => {
    beforeEach(() => {
        mockUseGeneratedGetCustomer.mockClear()
    })

    it('uses a one hour stale time', () => {
        renderHook(() =>
            useGetCustomer(1, undefined, {
                query: {
                    enabled: true,
                    staleTime: DurationInMs.FiveMinutes,
                },
            }),
        )

        expect(GET_CUSTOMER_STALE_TIME_MS).toBe(DurationInMs.OneHour)
        expect(mockUseGeneratedGetCustomer).toHaveBeenCalledWith(1, undefined, {
            query: {
                enabled: true,
                staleTime: DurationInMs.OneHour,
            },
        })
    })

    it('preserves params, http options, and query options', () => {
        const params = { include: ['integrations'] } as any
        const http = { headers: { 'X-Test': 'true' } } as any

        renderHook(() =>
            useGetCustomer(2, params, {
                http,
                query: {
                    retry: false,
                },
            }),
        )

        expect(mockUseGeneratedGetCustomer).toHaveBeenCalledWith(2, params, {
            http,
            query: {
                retry: false,
                staleTime: DurationInMs.OneHour,
            },
        })
    })
})
