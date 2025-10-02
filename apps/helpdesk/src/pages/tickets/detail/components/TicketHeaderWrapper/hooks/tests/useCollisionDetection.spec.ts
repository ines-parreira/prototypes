import { renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'

import useAblyRealtimePresence from '../useAblyRealtimePresence'
import useCollisionDetection from '../useCollisionDetection'
import useSocketIOPresence from '../useSocketIOPresence'

jest.mock('core/flags')
jest.mock('../useAblyRealtimePresence')
jest.mock('../useSocketIOPresence')

const mockUseFlag = useFlag as jest.Mock
const mockUseAblyRealtimePresence = useAblyRealtimePresence as jest.Mock
const mockUseSocketIOPresence = useSocketIOPresence as jest.Mock

describe('useCollisionDetection', () => {
    const ticketId = 123

    const mockPresence1 = {
        agentsViewing: [{ id: 'agent1' }],
        agentsViewingNotTyping: [{ id: 'agent1' }],
        agentsTyping: [],
        hasBoth: false,
    }

    const mockPresence2 = {
        agentsViewing: [{ id: 'agent2' }],
        agentsViewingNotTyping: [{ id: 'agent2' }],
        agentsTyping: [],
        hasBoth: false,
    }

    it('should use SocketIO presence when FF is false', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseSocketIOPresence.mockReturnValue(mockPresence1)
        mockUseAblyRealtimePresence.mockReturnValue(mockPresence2)

        const { result } = renderHook(() => useCollisionDetection(ticketId))

        expect(result.current).toEqual(mockPresence1)
    })

    it('should use Realtime presence when FF is true', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseSocketIOPresence.mockReturnValue(mockPresence2)
        mockUseAblyRealtimePresence.mockReturnValue(mockPresence1)

        const { result } = renderHook(() => useCollisionDetection(ticketId))

        expect(result.current).toEqual(mockPresence1)
    })
})
