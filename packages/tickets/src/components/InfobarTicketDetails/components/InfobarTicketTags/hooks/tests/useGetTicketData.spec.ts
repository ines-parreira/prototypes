import { renderHook } from '@testing-library/react'

import { useGetTicket } from '../../../../../../hooks/useGetTicket'
import { useGetTicketData } from '../useGetTicketData'

vi.mock('../../../../../../hooks/useGetTicket', () => ({
    useGetTicket: vi.fn(() => ({
        data: null,
    })),
}))

const useGetTicketMock = vi.mocked(useGetTicket)

describe('useGetTicketData', () => {
    it('delegates to useGetTicket with a numeric ticket id', () => {
        const { result } = renderHook(() => useGetTicketData('1'))

        expect(result.current).toEqual({ data: null })
        expect(useGetTicketMock).toHaveBeenCalledWith(1)
    })
})
