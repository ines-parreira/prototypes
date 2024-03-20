import {fromJS} from 'immutable'
import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'
import useAppSelector from 'hooks/useAppSelector'
import * as viewUtils from 'state/views/utils'

import useIsTicketViewed from '../useIsTicketViewed'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const agentsViewingMessageSpy = jest.spyOn(viewUtils, 'agentsViewingMessage')

describe('useIsTicketViewed', () => {
    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(fromJS([]))
        agentsViewingMessageSpy.mockReturnValue('')
    })

    it('should return false when no agents are viewing the ticket', () => {
        const {result} = renderHook(() => useIsTicketViewed(1))

        expect(result.current.isTicketViewed).toBe(false)
        expect(result.current.agentViewingMessage).toBe('')
    })

    it('should return true when agents are viewing the ticket', () => {
        mockUseAppSelector.mockReturnValue(fromJS([{}]))

        const {result} = renderHook(() => useIsTicketViewed(1))

        expect(result.current.isTicketViewed).toBe(true)
        expect(result.current.agentViewingMessage).toBe('')
    })
})
