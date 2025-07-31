import { renderHook } from '@repo/testing'

import { useAgentActivity } from '@gorgias/realtime'

import useViewTickets, { DEBOUNCED_VIEW_TICKETS_DELAY } from '../useViewTickets'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useViewTickets', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('should call viewTickets with ticket ids', () => {
        const partials = [
            { id: 1, cursor: '1', updated_datetime: 1 },
            { id: 2, cursor: '2', updated_datetime: 1 },
        ]
        const viewTickets = jest.fn()
        mockUseAgentActivity.mockReturnValue({ viewTickets })

        renderHook(() => useViewTickets(partials))

        jest.advanceTimersByTime(0)

        expect(viewTickets).toHaveBeenCalledWith([1, 2])
    })

    it('should debounce the call to viewTickets with ticket ids', () => {
        const partials = [
            { id: 3, cursor: '3', updated_datetime: 1 },
            { id: 4, cursor: '4', updated_datetime: 1 },
        ]
        const viewTickets = jest.fn()
        mockUseAgentActivity.mockReturnValue({ viewTickets })

        renderHook(() => useViewTickets(partials))

        jest.advanceTimersByTime(DEBOUNCED_VIEW_TICKETS_DELAY)

        expect(viewTickets).toHaveBeenCalledWith([3, 4])
    })
})
