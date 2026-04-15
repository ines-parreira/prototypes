import { renderHook } from '@testing-library/react'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'
import type { useAgentActivity } from '@gorgias/realtime'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime'

import { useViewVisibleTickets } from '../useViewVisibleTickets'

vi.mock('@gorgias/realtime', () => ({
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
})

afterEach(() => {
    vi.clearAllMocks()
})

describe('useViewVisibleTickets', () => {
    it('should not call viewTickets when visible tickets array is empty', () => {
        const { result } = renderHook(() => useViewVisibleTickets())

        result.current.viewVisibleTickets([])

        expect(mockViewTickets).not.toHaveBeenCalled()
    })

    it('should call viewTickets with visible ticket ids', () => {
        const { result } = renderHook(() => useViewVisibleTickets())
        const tickets = [
            mockTicketCompact({ id: 1 }),
            mockTicketCompact({ id: 2 }),
        ]

        result.current.viewVisibleTickets(tickets)

        expect(mockViewTickets).toHaveBeenCalledTimes(1)
        expect(mockViewTickets).toHaveBeenCalledWith([1, 2])
    })

    it('should clear viewed tickets on unmount', () => {
        const { result, unmount } = renderHook(() => useViewVisibleTickets())

        result.current.viewVisibleTickets([mockTicketCompact({ id: 1 })])
        expect(mockViewTickets).toHaveBeenCalledTimes(1)

        result.current.viewVisibleTickets([mockTicketCompact({ id: 2 })])
        expect(mockViewTickets).toHaveBeenCalledTimes(2)

        unmount()

        expect(mockViewTickets).toHaveBeenCalledTimes(3)
        expect(mockViewTickets).toHaveBeenNthCalledWith(3, [])
    })
})
