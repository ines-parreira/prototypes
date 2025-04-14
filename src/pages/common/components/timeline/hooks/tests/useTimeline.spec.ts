import { renderHook } from '@testing-library/react-hooks'
import { fromJS, List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { useSearchParam } from 'hooks/useSearchParam'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { assumeMock } from 'utils/testing'

import { useTimeline } from '../useTimeline'

jest.mock('common/segment')
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('hooks/useSearchParam')
jest.mock('state/customers/selectors')
jest.mock('state/ticket/selectors')

const useSearchParamMock = assumeMock(useSearchParam)
const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getTicketStateMock = assumeMock(getTicketState)
const logEventMock = assumeMock(logEvent)
const getLoadingMock = assumeMock(getLoading)

describe('useTimeline', () => {
    const mockSetTimelineShopperId = jest.fn()
    const mockTicket = fromJS({
        messages: List([1, 2, 3]),
        channel: 'email',
    })
    const mockCustomerHistory = {
        tickets: [{ id: 1 }, { id: 2 }],
    }
    const mockLoading = fromJS({ history: true })

    beforeEach(() => {
        getLoadingMock.mockReturnValue(mockLoading)
        useSearchParamMock.mockReturnValue([null, mockSetTimelineShopperId])
        getTicketStateMock.mockReturnValue(mockTicket)
        getCustomerHistoryMock.mockReturnValue(fromJS(mockCustomerHistory))
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

    it('should return customer history tickets', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.tickets).toEqual(mockCustomerHistory.tickets)
    })

    it('should return loading state', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return hasTriedLoading from customer history', () => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                ...mockCustomerHistory,
                triedLoading: true,
            }),
        )

        const { result } = renderHook(() => useTimeline())

        expect(result.current.hasTriedLoading).toBe(true)
    })

    describe('opening / closing Timeline', () => {
        it('should set shopper ID and log event when opening timeline', () => {
            useSearchParamMock.mockReturnValue(['ok', mockSetTimelineShopperId])
            const { result } = renderHook(() => useTimeline())

            result.current.openTimeline(123)

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith('123')
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.UserHistoryToggled,
                {
                    open: true,
                    nbOfTicketsInTimeline: 2,
                    nbOfMessagesInTicket: 3,
                    channel: 'email',
                },
            )
        })

        it('should clear shopper ID and log event when closing timeline', () => {
            const { result } = renderHook(() => useTimeline())

            result.current.closeTimeline()

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith(null)
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.UserHistoryToggled,
                {
                    open: false,
                    nbOfTicketsInTimeline: 2,
                    nbOfMessagesInTicket: 3,
                    channel: 'email',
                },
            )
        })
    })
})
