import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { useAgentActivity } from '@gorgias/realtime'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'

import useAgentsViewing from '../useAgentsViewing'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockGetTicketActivity = jest.fn()

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

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

    it('should return agents from ticket activity when realtime is enabled', () => {
        const currentUser = fromJS({ id: 'agent1' })
        const ticketActivity = {
            viewing: [{ id: 'agent1' }, { id: 'agent2' }],
        }

        mockUseFlag.mockReturnValue(true)
        mockUseAppSelector.mockReturnValue(currentUser)
        mockUseAgentActivity.mockReturnValue({
            getTicketActivity: () => ticketActivity,
        })

        const { result } = renderHook(() => useAgentsViewing(ticketId))

        expect(result.current.agentsViewing).toEqual([{ id: 'agent2' }])
    })

    it('should return agents from state when realtime is disabled', () => {
        const currentUser = fromJS({ id: 'currentUser' })
        const agentsOnTicket = fromJS([{ id: 'agent1' }, { id: 'agent2' }])

        mockUseFlag.mockReturnValue(false)
        mockUseAppSelector
            .mockReturnValueOnce(currentUser)
            .mockReturnValueOnce(agentsOnTicket)

        const { result } = renderHook(() => useAgentsViewing(ticketId))

        expect(result.current.agentsViewing).toEqual([
            { id: 'agent1' },
            { id: 'agent2' },
        ])
    })
})
