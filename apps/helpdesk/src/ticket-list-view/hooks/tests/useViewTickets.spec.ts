import { renderHook } from '@repo/testing'

import { useAgentActivity } from '@gorgias/realtime'

import useViewTickets from '../useViewTickets'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useViewTickets', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call viewTickets with ticket ids', () => {
        const partials = [
            { id: 1, cursor: '1', updated_datetime: 1 },
            { id: 2, cursor: '2', updated_datetime: 1 },
        ]
        const viewTickets = jest.fn()
        mockUseAgentActivity.mockReturnValue({ viewTickets })

        renderHook(() => useViewTickets(partials))

        expect(viewTickets).toHaveBeenCalledWith([1, 2])
    })

    it('should clear viewed tickets on unmount', () => {
        const partials = [
            { id: 5, cursor: '5', updated_datetime: 1 },
            { id: 6, cursor: '6', updated_datetime: 1 },
        ]
        const viewTickets = jest.fn()
        mockUseAgentActivity.mockReturnValue({ viewTickets })

        const { unmount } = renderHook(() => useViewTickets(partials))

        unmount()

        expect(viewTickets).toHaveBeenNthCalledWith(1, [])
        expect(viewTickets).toHaveBeenNthCalledWith(2, [5, 6])
        expect(viewTickets).toHaveBeenNthCalledWith(3, [])
    })
})
