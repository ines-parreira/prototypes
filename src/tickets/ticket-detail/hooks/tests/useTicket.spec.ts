import { renderHook } from '@testing-library/react-hooks'

import { useGetTicket } from '@gorgias/api-queries'

import { useTicket } from '../useTicket'

jest.mock('@gorgias/api-queries', () => ({ useGetTicket: jest.fn() }))
const useGetTicketMock = useGetTicket as jest.Mock

describe('useTicket', () => {
    beforeEach(() => {
        useGetTicketMock.mockReturnValue({ data: undefined, isLoading: true })
    })

    it('should return the loading state', () => {
        const { result } = renderHook(() => useTicket(1))
        expect(result.current).toEqual({ isLoading: true, ticket: undefined })
    })

    it('should return the ticket after loading', () => {
        useGetTicketMock.mockReturnValue({
            data: { data: { id: 1 } },
            isLoading: false,
        })
        const { result } = renderHook(() => useTicket(1))
        expect(result.current).toEqual({ isLoading: false, ticket: { id: 1 } })
    })
})
