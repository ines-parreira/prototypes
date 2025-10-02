import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useAblyAgentActivity } from 'providers/realtime-ably/hooks/useAblyAgentActivity'

import useAblyRealtimePresence from '../useAblyRealtimePresence'

jest.mock('providers/realtime-ably/hooks/useAblyAgentActivity')
jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAblyAgentActivity = useAblyAgentActivity as jest.Mock

describe('useAblyRealtimePresence', () => {
    const ticketId = 123

    it('should return the correct presence data', () => {
        const currentUser = fromJS({ id: 'currentUser' })
        const ticketActivity = {
            viewing: [{ id: 'agent1' }, { id: 'agent2' }],
            typing: [{ id: 'agent2' }],
        }

        mockUseAppSelector.mockReturnValue(currentUser)
        mockUseAblyAgentActivity.mockReturnValue({
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
