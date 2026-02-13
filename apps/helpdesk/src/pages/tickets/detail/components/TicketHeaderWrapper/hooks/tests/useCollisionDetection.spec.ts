import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useAgentActivity } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'

import useCollisionDetection from '../useCollisionDetection'

jest.mock('@gorgias/realtime-ably')
jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAgentActivity = useAgentActivity as jest.Mock

describe('useCollisionDetection', () => {
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

        const { result } = renderHook(() => useCollisionDetection(ticketId))

        expect(result.current).toEqual({
            agentsViewing: [{ id: 'agent1' }, { id: 'agent2' }],
            agentsViewingNotTyping: [{ id: 'agent1' }],
            agentsTyping: [{ id: 'agent2' }],
            hasBoth: true,
        })
    })
})
