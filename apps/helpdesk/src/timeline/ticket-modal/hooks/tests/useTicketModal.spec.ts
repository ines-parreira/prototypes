import { act } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { renderHook } from 'utils/testing/renderHook'

import { useTicketModal } from '../useTicketModal'

jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))

describe('useTicketModal', () => {
    it('should return the default props', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))
        expect(result.current).toEqual({
            ticketId: null,
            onClose: expect.any(Function),
            onOpen: expect.any(Function),
            onNext: undefined,
            onPrevious: undefined,
        })
    })

    it('should open the first ticket', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(1)
        })

        expect(result.current).toEqual({
            ticketId: 1,
            onClose: expect.any(Function),
            onOpen: expect.any(Function),
            onNext: expect.any(Function),
            onPrevious: undefined,
        })
    })

    it('should open the last ticket', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(3)
        })

        expect(result.current).toEqual({
            ticketId: 3,
            onClose: expect.any(Function),
            onOpen: expect.any(Function),
            onNext: undefined,
            onPrevious: expect.any(Function),
        })
    })

    it('should open the middle ticket', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(2)
        })

        expect(result.current).toEqual({
            ticketId: 2,
            onClose: expect.any(Function),
            onOpen: expect.any(Function),
            onNext: expect.any(Function),
            onPrevious: expect.any(Function),
        })
    })

    it('should navigate to the next ticket and track the event', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(1)
        })

        act(() => {
            result.current.onNext!()
        })

        expect(result.current.ticketId).toBe(2)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineModalNextClicked,
        )
    })

    it('should navigate to the previous ticket and track the event', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(3)
        })

        act(() => {
            result.current.onPrevious!()
        })

        expect(result.current.ticketId).toBe(2)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineModalPrevClicked,
        )
    })

    it('should close', () => {
        const { result } = renderHook(() => useTicketModal([1, 2, 3]))

        act(() => {
            result.current.onOpen(3)
        })

        act(() => {
            result.current.onClose()
        })

        expect(result.current.ticketId).toBe(null)
    })
})
