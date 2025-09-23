import { renderHook } from '@testing-library/react'

import { useTicket } from '../useTicket'

vi.mock('@gorgias/helpdesk-queries', () => ({
    useGetTicket: vi.fn(() => ({
        data: null,
    })),
}))

describe('useTicket', () => {
    it('should return the return value of the api sdk method', () => {
        const { result } = renderHook(() => useTicket(1))
        expect(result.current).toEqual({ data: null })
    })
})
