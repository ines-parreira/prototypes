import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useAgentActivity } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'

import useAblyRealtimePresence from '../useAblyRealtimePresence'

jest.mock('@gorgias/realtime-ably')
jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useAblyRealtimePresence', () => {
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

        const { result } = renderHook(() => useAblyRealtimePresence(ticketId))

        expect(result.current).toEqual({
            agentsViewing: [{ id: 'agent1' }, { id: 'agent2' }],
            agentsViewingNotTyping: [{ id: 'agent1' }],
            agentsTyping: [{ id: 'agent2' }],
            hasBoth: true,
        })
    })
})
