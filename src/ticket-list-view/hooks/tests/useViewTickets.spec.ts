import {useAgentActivity} from '@gorgias/realtime'
import {renderHook} from '@testing-library/react-hooks'

import useViewTickets from '../useViewTickets'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useViewTickets', () => {
    it('should call viewTickets with ticket ids', () => {
        const partials = [
            {id: 1, updated_datetime: 1},
            {id: 2, updated_datetime: 1},
        ]
        const viewTickets = jest.fn()
        mockUseAgentActivity.mockReturnValue({viewTickets})

        renderHook(() => useViewTickets(partials))

        expect(viewTickets).toHaveBeenCalledWith([1, 2])
    })
})
