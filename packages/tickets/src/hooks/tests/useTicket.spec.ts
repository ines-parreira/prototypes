import { renderHook } from '@testing-library/react'

import { useGetTicket } from '../useGetTicket'
import { useTicket } from '../useTicket'

vi.mock('../useGetTicket', () => ({
    useGetTicket: vi.fn(() => ({
        data: null,
    })),
}))

const useGetTicketMock = vi.mocked(useGetTicket)

describe('useTicket', () => {
    it('delegates to useGetTicket', () => {
        const { result } = renderHook(() => useTicket(1))

        expect(result.current).toEqual({ data: null })
        expect(useGetTicketMock).toHaveBeenCalledWith(1)
    })
})
