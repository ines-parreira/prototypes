import { act, renderHook } from '@testing-library/react'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'
import type { useAgentActivity } from '@gorgias/realtime-ably'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime-ably'

import { useViewVisibleTickets } from '../useViewVisibleTickets'

vi.mock('@gorgias/realtime-ably', () => ({
    useAgentActivity: vi.fn(),
}))

type AgentActivity = ReturnType<typeof useAgentActivity>

function makeAgentActivity(
    overrides: Partial<AgentActivity> = {},
): AgentActivity {
    return {
        viewTickets: vi.fn(),
        joinTicket: vi.fn(),
        leaveTicket: vi.fn(),
        getTicketActivity: vi.fn().mockReturnValue({ viewing: [], typing: [] }),
        startTyping: vi.fn().mockResolvedValue(undefined),
        stopTyping: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    }
}

const mockViewTickets = vi.fn()

beforeEach(() => {
    vi.mocked(useAgentActivityMock).mockReturnValue(
        makeAgentActivity({ viewTickets: mockViewTickets }),
    )
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe('useViewVisibleTickets', () => {
    it('should not call viewTickets when visible tickets array is empty', () => {
        const { result } = renderHook(() => useViewVisibleTickets())

        result.current.viewVisibleTickets([])

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(mockViewTickets).not.toHaveBeenCalled()
    })

    it('should call viewTickets immediately on the first call', () => {
        const { result } = renderHook(() => useViewVisibleTickets())
        const tickets = [
            mockTicketCompact({ id: 1 }),
            mockTicketCompact({ id: 2 }),
        ]

        result.current.viewVisibleTickets(tickets)

        expect(mockViewTickets).toHaveBeenCalledTimes(1)
        expect(mockViewTickets).toHaveBeenCalledWith([1, 2])

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        // No trailing call — only one invocation was made during the debounce period
        expect(mockViewTickets).toHaveBeenCalledTimes(1)
    })

    it('should fire immediately on first call and at trailing edge after rapid successive calls', () => {
        const { result } = renderHook(() => useViewVisibleTickets())

        result.current.viewVisibleTickets([mockTicketCompact({ id: 1 })])

        // Leading edge fires immediately
        expect(mockViewTickets).toHaveBeenCalledTimes(1)
        expect(mockViewTickets).toHaveBeenCalledWith([1])

        act(() => {
            vi.advanceTimersByTime(500)
        })

        result.current.viewVisibleTickets([mockTicketCompact({ id: 2 })])

        act(() => {
            vi.advanceTimersByTime(500)
        })

        // 500ms after the second call — trailing hasn't fired yet
        expect(mockViewTickets).toHaveBeenCalledTimes(1)

        act(() => {
            vi.advanceTimersByTime(500)
        })

        // Trailing fires with the last set of visible tickets
        expect(mockViewTickets).toHaveBeenCalledTimes(2)
        expect(mockViewTickets).toHaveBeenLastCalledWith([2])
    })

    it('should cancel the pending trailing call on unmount', () => {
        const { result, unmount } = renderHook(() => useViewVisibleTickets())

        // First call fires immediately (leading)
        result.current.viewVisibleTickets([mockTicketCompact({ id: 1 })])
        expect(mockViewTickets).toHaveBeenCalledTimes(1)

        // Second call within the debounce window schedules a trailing call
        result.current.viewVisibleTickets([mockTicketCompact({ id: 2 })])
        expect(mockViewTickets).toHaveBeenCalledTimes(1)

        unmount()

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        // Trailing call was cancelled on unmount
        expect(mockViewTickets).toHaveBeenCalledTimes(1)
    })

    it('should recreate the debounced function when viewTickets reference changes', () => {
        const mockViewTickets2 = vi.fn()
        const { result, rerender } = renderHook(() => useViewVisibleTickets())

        result.current.viewVisibleTickets([mockTicketCompact({ id: 1 })])

        expect(mockViewTickets).toHaveBeenCalledWith([1])

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(mockViewTickets).toHaveBeenCalledTimes(1)

        vi.mocked(useAgentActivityMock).mockReturnValue(
            makeAgentActivity({ viewTickets: mockViewTickets2 }),
        )

        rerender()

        result.current.viewVisibleTickets([mockTicketCompact({ id: 2 })])

        expect(mockViewTickets2).toHaveBeenCalledWith([2])

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(mockViewTickets2).toHaveBeenCalledTimes(1)
    })
})
