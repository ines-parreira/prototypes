import { useListTickets } from '@gorgias/helpdesk-queries'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../../constants'
import { useTimelineData } from '../useTimelineData'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListTickets: jest.fn(),
}))

const useListTicketsMock = assumeMock(useListTickets)

describe('useTimelineData', () => {
    const ticketList = [
        {
            id: 1,
        },
        {
            id: 2,
        },
    ]

    beforeEach(() => {
        useListTicketsMock.mockReturnValue({
            data: {
                data: { data: ticketList },
            },
            isLoading: true as boolean,
        } as ReturnType<typeof useListTickets>)
    })

    it('should call useListTicket with correct params', () => {
        const { rerender } = renderHook((id?: number) => useTimelineData(id))

        expect(useListTicketsMock).toHaveBeenCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: undefined,
            },
            {
                query: {
                    enabled: false,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )

        rerender(123)

        expect(useListTicketsMock).toHaveBeenLastCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: 123,
            },
            {
                query: {
                    enabled: true,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )
    })

    it('should return customer ticket list', () => {
        const { result } = renderHook(() => useTimelineData(123))

        expect(result.current.tickets).toEqual(ticketList)
    })

    it('should return empty array if customer id is not provided', () => {
        const { result } = renderHook(() => useTimelineData())

        expect(result.current.tickets).toEqual([])
    })

    it('should return loading state', () => {
        const { result } = renderHook(() => useTimelineData())

        expect(result.current.isLoading).toBe(true)
    })
})
