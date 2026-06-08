import { renderHook } from '@testing-library/react'
import { Duration } from '@gorgias/toolkit'

import { useGetTicket as useGetTicketPrimitive } from '@gorgias/helpdesk-queries'

import { useGetTicket } from '../useGetTicket'

const useGetTicketPrimitiveMock = vi.mocked(useGetTicketPrimitive)

vi.mock('@gorgias/helpdesk-queries', () => ({
    useGetTicket: vi.fn(() => ({
        data: null,
    })),
}))

describe('useGetTicket', () => {
    it('should return the return value of the api sdk method', () => {
        const { result } = renderHook(() => useGetTicket(1))

        expect(result.current).toEqual({ data: null })
    })

    it('sets the default stale time on the primitive query options', () => {
        renderHook(() => useGetTicket(1))

        expect(useGetTicketPrimitiveMock).toHaveBeenCalledWith(1, undefined, {
            query: {
                staleTime: Duration.minutes(5),
            },
        })
    })

    it('lets callers override query options', () => {
        renderHook(() =>
            useGetTicket(1, { relationships: [] }, { query: { staleTime: 0 } }),
        )

        expect(useGetTicketPrimitiveMock).toHaveBeenCalledWith(
            1,
            { relationships: [] },
            {
                query: {
                    staleTime: 0,
                },
            },
        )
    })
})
