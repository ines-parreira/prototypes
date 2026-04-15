import { useEffect } from 'react'

import { act, render } from '@testing-library/react'

import type { useAgentActivity } from '@gorgias/realtime'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime'

import {
    TICKETS_VIEWING_DEBOUNCE_TIME,
    useViewedTickets,
    ViewedTicketsProvider,
} from '../ViewedTicketsProvider'

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

type ConsumerProps = {
    ids: number[]
}

function Consumer({ ids }: ConsumerProps) {
    const { viewTickets } = useViewedTickets()

    useEffect(() => {
        viewTickets(ids)
    }, [ids, viewTickets])

    useEffect(() => {
        return () => {
            viewTickets([])
        }
    }, [viewTickets])

    return null
}

describe('ViewedTicketsProvider', () => {
    const mockViewTickets = vi.fn()

    beforeEach(() => {
        mockViewTickets.mockReset()
        vi.useFakeTimers()
        vi.mocked(useAgentActivityMock).mockReturnValue(
            makeAgentActivity({ viewTickets: mockViewTickets }),
        )
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should debounce handoff updates so the latest ticket ids are used', async () => {
        const { rerender } = render(
            <ViewedTicketsProvider>
                <Consumer key="legacy" ids={[1, 2]} />
            </ViewedTicketsProvider>,
        )

        act(() => {
            vi.advanceTimersByTime(TICKETS_VIEWING_DEBOUNCE_TIME)
        })

        expect(mockViewTickets).toHaveBeenCalledWith([1, 2])

        rerender(
            <ViewedTicketsProvider>
                <Consumer key="modern" ids={[3, 4]} />
            </ViewedTicketsProvider>,
        )

        act(() => {
            vi.advanceTimersByTime(TICKETS_VIEWING_DEBOUNCE_TIME)
        })

        expect(mockViewTickets).toHaveBeenLastCalledWith([3, 4])

        expect(mockViewTickets.mock.calls).toEqual([[[1, 2]], [[3, 4]]])
    })
})
