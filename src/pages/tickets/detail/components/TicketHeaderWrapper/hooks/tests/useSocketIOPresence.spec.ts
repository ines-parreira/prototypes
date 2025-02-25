import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import useSocketIOPresence from '../useSocketIOPresence'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock

describe('useSocketIOPresence', () => {
    it('should return empty arrays if state is empty', () => {
        mockUseAppSelector.mockReturnValue(fromJS([]))

        const { result } = renderHook(() => useSocketIOPresence())

        expect(result.current).toEqual({
            agentsViewing: [],
            agentsViewingNotTyping: [],
            agentsTyping: [],
            hasBoth: false,
        })
    })

    it('should return the correct presence data', () => {
        mockUseAppSelector.mockReturnValue(
            fromJS([{ id: 'agent1' }, { id: 'agent2' }]),
        )

        const { result } = renderHook(() => useSocketIOPresence())

        expect(result.current).toEqual({
            agentsViewing: [{ id: 'agent1' }, { id: 'agent2' }],
            agentsViewingNotTyping: [],
            agentsTyping: [{ id: 'agent1' }, { id: 'agent2' }],
            hasBoth: false,
        })
    })
})
