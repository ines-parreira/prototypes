import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useAgentActivity } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'

import useAgentsViewing from '../useAgentsViewing'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockGetTicketActivity = jest.fn()

describe('useAgentsViewing', () => {
    const ticketId = 123

    beforeEach(() => {
        mockGetTicketActivity.mockReturnValue({
            viewing: [],
        })
        mockUseAgentActivity.mockReturnValue({
            getTicketActivity: mockGetTicketActivity,
        })
    })

    it('should return agents from ticket activity', () => {
        const currentUser = fromJS({ id: 'agent1' })
        const ticketActivity = {
            viewing: [{ id: 'agent1' }, { id: 'agent2' }],
        }

        mockUseAppSelector.mockReturnValue(currentUser)
        mockUseAgentActivity.mockReturnValue({
            getTicketActivity: () => ticketActivity,
        })

        const { result } = renderHook(() => useAgentsViewing(ticketId))

        expect(result.current.agentsViewing).toEqual([{ id: 'agent2' }])
    })
})
