import useAgentsViewing from 'hooks/realtime/useAgentsViewing'
import * as viewUtils from 'state/views/utils'
import { renderHook } from 'utils/testing/renderHook'

import useIsTicketViewed from '../useIsTicketViewed'

jest.mock('hooks/useAppSelector')

const agentsViewingMessageSpy = jest.spyOn(viewUtils, 'agentsViewingMessage')

jest.mock('hooks/realtime/useAgentsViewing')
const mockUseAgentsViewing = useAgentsViewing as jest.Mock

describe('useIsTicketViewed', () => {
    beforeEach(() => {
        mockUseAgentsViewing.mockReturnValue({ agentsViewing: [] })
        agentsViewingMessageSpy.mockReturnValue('')
    })

    it('should return false when no agents are viewing the ticket', () => {
        const { result } = renderHook(() => useIsTicketViewed(1))

        expect(result.current.isTicketViewed).toBe(false)
        expect(result.current.agentViewingMessage).toBe('')
    })

    it('should return true when agents are viewing the ticket', () => {
        mockUseAgentsViewing.mockReturnValue({ agentsViewing: [{}] })

        const { result } = renderHook(() => useIsTicketViewed(1))

        expect(result.current.isTicketViewed).toBe(true)
        expect(result.current.agentViewingMessage).toBe('')
    })
})
