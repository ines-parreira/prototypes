import { fromJS, List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { getTicketState } from 'state/ticket/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTimelinePanel } from '../useTimelinePanel'
import { useTrackTimelineToggle } from '../useTrackTimelineToggle'

jest.mock('common/segment')
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('../useTimelinePanel')
jest.mock('state/ticket/selectors')

const useTimelinePanelMock = assumeMock(useTimelinePanel)
const getTicketStateMock = assumeMock(getTicketState)
const logEventMock = assumeMock(logEvent)

describe('useTrackTimelineToggle', () => {
    const mockTicket = fromJS({
        messages: List([1, 2, 3]),
        channel: 'email',
    })

    beforeEach(() => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: false,
            shopperId: null,
        } as ReturnType<typeof useTimelinePanel>)
        getTicketStateMock.mockReturnValue(mockTicket)
    })

    it('should track when timeline is opened', () => {
        const { rerender } = renderHook(() => useTrackTimelineToggle())

        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            shopperId: 123,
        } as ReturnType<typeof useTimelinePanel>)

        rerender()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: true,
                nbOfMessagesInTicket: 3,
                channel: 'email',
            },
        )
    })

    it('should track when timeline is closed', () => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            shopperId: 123,
        } as ReturnType<typeof useTimelinePanel>)

        const { rerender } = renderHook(() => useTrackTimelineToggle())

        useTimelinePanelMock.mockReturnValue({
            isOpen: false,
            shopperId: null,
        } as ReturnType<typeof useTimelinePanel>)

        rerender()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: false,
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

        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            shopperId: 123,
        } as ReturnType<typeof useTimelinePanel>)

        rerender()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: true,
                nbOfMessagesInTicket: 0,
                channel: 'email',
            },
        )
    })
})
