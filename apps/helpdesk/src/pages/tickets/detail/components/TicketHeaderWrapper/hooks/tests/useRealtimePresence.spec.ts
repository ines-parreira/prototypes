import { fromJS } from 'immutable'

import { useAgentActivity } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { renderHook } from 'utils/testing/renderHook'

import useRealtimePresence from '../useRealtimePresence'

jest.mock('hooks/useAppSelector')
jest.mock('@gorgias/realtime')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useRealtimePresence', () => {
    const ticketId = 123

    it('should return the correct presence data', () => {
        const currentUser = fromJS({ id: 'currentUser' })
        const ticketActivity = {
            viewing: [{ id: 'agent1' }, { id: 'agent2' }],
            typing: [{ id: 'agent2' }],
        }

        mockUseAppSelector.mockReturnValue(currentUser)
        mockUseAgentActivity.mockReturnValue({
            getTicketActivity: () => ticketActivity,
        })

        const { result } = renderHook(() => useRealtimePresence(ticketId))

        expect(result.current).toEqual({
            agentsViewing: [{ id: 'agent1' }, { id: 'agent2' }],
            agentsViewingNotTyping: [{ id: 'agent1' }],
            agentsTyping: [{ id: 'agent2' }],
            hasBoth: true,
        })
    })
})
