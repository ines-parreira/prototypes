import { fromJS, List } from 'immutable'

import { TicketSummary } from '@gorgias/api-types'

import { logEvent, SegmentEvent } from 'common/segment'
import { getTicketState } from 'state/ticket/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTimeline } from '../useTimeline'
import { useTrackTimelineToggle } from '../useTrackTimelineToggle'

jest.mock('common/segment')
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('../useTimeline')
jest.mock('state/ticket/selectors')

const useTimelineMock = assumeMock(useTimeline)
const getTicketStateMock = assumeMock(getTicketState)
const logEventMock = assumeMock(logEvent)

describe('useTrackTimelineToggle', () => {
    const dummyTicket1 = { id: 1 } as TicketSummary
    const dummyTicket2 = { id: 2 } as TicketSummary
    const mockTicket = fromJS({
        messages: List([1, 2, 3]),
        channel: 'email',
    })

    beforeEach(() => {
        useTimelineMock.mockReturnValue({
            tickets: [{ dummyTicket1 }, dummyTicket2],
            timelineShopperId: null,
        } as ReturnType<typeof useTimeline>)
        getTicketStateMock.mockReturnValue(mockTicket)
    })

    it('should track when timeline is opened', () => {
        const { rerender } = renderHook(() => useTrackTimelineToggle())

        useTimelineMock.mockReturnValue({
            tickets: [dummyTicket1, dummyTicket2],
            timelineShopperId: '123',
        } as ReturnType<typeof useTimeline>)

        rerender()

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

    it('should track when timeline is closed', () => {
        useTimelineMock.mockReturnValue({
            tickets: [dummyTicket1, dummyTicket2],
            timelineShopperId: '123',
        } as ReturnType<typeof useTimeline>)

        const { rerender } = renderHook(() => useTrackTimelineToggle())

        useTimelineMock.mockReturnValue({
            tickets: [dummyTicket1, dummyTicket2],
            timelineShopperId: null,
        } as ReturnType<typeof useTimeline>)

        rerender()

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

    it('should not track when timeline state has not changed', () => {
        const { rerender } = renderHook(() => useTrackTimelineToggle())

        rerender()

        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('should handle ticket with no messages', () => {
        getTicketStateMock.mockReturnValue(
            fromJS({
                channel: 'email',
            }),
        )

        const { rerender } = renderHook(() => useTrackTimelineToggle())

        useTimelineMock.mockReturnValue({
            tickets: [dummyTicket1, dummyTicket2],
            timelineShopperId: '123',
        } as ReturnType<typeof useTimeline>)

        rerender()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: true,
                nbOfTicketsInTimeline: 2,
                nbOfMessagesInTicket: 0,
                channel: 'email',
            },
        )
    })
})
