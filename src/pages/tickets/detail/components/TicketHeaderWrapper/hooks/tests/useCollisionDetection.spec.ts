import {renderHook} from '@testing-library/react-hooks'

import {useFlag} from 'common/flags'

import useCollisionDetection from '../useCollisionDetection'
import useRealtimePresence from '../useRealtimePresence'
import useSocketIOPresence from '../useSocketIOPresence'

jest.mock('common/flags')
jest.mock('../useRealtimePresence')
jest.mock('../useSocketIOPresence')

const mockUseFlag = useFlag as jest.Mock
const mockUseRealtimePresence = useRealtimePresence as jest.Mock
const mockUseSocketIOPresence = useSocketIOPresence as jest.Mock

describe('useCollisionDetection', () => {
    const ticketId = 123

    const mockPresence1 = {
        agentsViewing: [{id: 'agent1'}],
        agentsViewingNotTyping: [{id: 'agent1'}],
        agentsTyping: [],
        hasBoth: false,
    }

    const mockPresence2 = {
        agentsViewing: [{id: 'agent2'}],
        agentsViewingNotTyping: [{id: 'agent2'}],
        agentsTyping: [],
        hasBoth: false,
    }

    it('should use SocketIO presence when FF is false', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseSocketIOPresence.mockReturnValue(mockPresence1)
        mockUseRealtimePresence.mockReturnValue(mockPresence2)

        const {result} = renderHook(() => useCollisionDetection(ticketId))

        expect(result.current).toEqual(mockPresence1)
    })

    it('should use Realtime presence when FF is true', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseSocketIOPresence.mockReturnValue(mockPresence2)
        mockUseRealtimePresence.mockReturnValue(mockPresence1)

        const {result} = renderHook(() => useCollisionDetection(ticketId))

        expect(result.current).toEqual(mockPresence1)
    })
})
