import {renderHook} from '@testing-library/react-hooks'

import * as activityTracker from 'services/activityTracker'
import {ActivityEvents} from 'services/activityTracker'

import {useTicketActivityTracking} from '../useTicketActivityTracking'

jest.mock('services/activityTracker')

describe('useTicketActivityTracking', () => {
    const mockLogActivityEvent = jest.spyOn(activityTracker, 'logActivityEvent')

    it('should log an event when the ticketId is defined', () => {
        const mockTicketId = 1

        const {unmount} = renderHook(() =>
            useTicketActivityTracking(mockTicketId)
        )
        expect(mockLogActivityEvent).toHaveBeenLastCalledWith(
            ActivityEvents.UserStartedWorkingOnTicket,
            {
                entityId: mockTicketId,
                entityType: 'ticket',
            }
        )

        unmount()
        expect(mockLogActivityEvent).toHaveBeenLastCalledWith(
            ActivityEvents.UserStoppedWorkingOnTicket,
            {
                entityId: mockTicketId,
                entityType: 'ticket',
            }
        )
    })

    it('should not log an event when the ticketId is undefined on mount', () => {
        const {unmount} = renderHook(() => useTicketActivityTracking(undefined))
        expect(mockLogActivityEvent).not.toHaveBeenCalled()

        unmount()
        expect(mockLogActivityEvent).not.toHaveBeenCalled()
    })
})
