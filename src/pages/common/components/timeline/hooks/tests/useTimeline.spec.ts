import { useListTickets } from '@gorgias/api-queries'

import { useSearchParam } from 'hooks/useSearchParam'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../../constants'
import { useTimeline } from '../useTimeline'

jest.mock('@gorgias/api-queries', () => ({
    ...jest.requireActual('@gorgias/api-queries'),
    useListTickets: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('hooks/useSearchParam')
jest.mock('state/customers/selectors')

const useSearchParamMock = assumeMock(useSearchParam)
const useListTicketsMock = assumeMock(useListTickets)

describe('useTimeline', () => {
    const mockSetTimelineShopperId = jest.fn()
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
        useSearchParamMock.mockReturnValue([null, mockSetTimelineShopperId])
    })

    it('should call useListTicket with correct params', () => {
        const { rerender } = renderHook((id?: number) => useTimeline(id))

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

    it('should return timeline not displayed when no shopper ID', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.timelineShopperId).toBeNull()
    })

    it('should return timeline displayed when shopper ID exists', () => {
        useSearchParamMock.mockReturnValue(['123', mockSetTimelineShopperId])

        const { result } = renderHook(() => useTimeline())

        expect(result.current.isOpen).toBe(true)
        expect(result.current.timelineShopperId).toBe('123')
    })

    it('should return customer ticket list', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.tickets).toEqual(ticketList)
    })

    it('should return loading state', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.isLoading).toBe(true)
    })

    describe('opening / closing Timeline', () => {
        it('should set shopper ID when opening timeline', () => {
            useSearchParamMock.mockReturnValue(['ok', mockSetTimelineShopperId])
            const { result } = renderHook(() => useTimeline())

            result.current.openTimeline(123)

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith('123')
        })

        it('should clear shopper ID when closing timeline', () => {
            const { result } = renderHook(() => useTimeline())

            result.current.closeTimeline()

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith(null)
        })

        it('should clear shopper ID when customer ID changes', () => {
            useSearchParamMock.mockReturnValue([
                '456',
                mockSetTimelineShopperId,
            ])

            renderHook(() => useTimeline(123))

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith(null)
        })
    })
})
