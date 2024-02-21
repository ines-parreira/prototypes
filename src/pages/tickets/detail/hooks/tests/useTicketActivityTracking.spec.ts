import {renderHook} from '@testing-library/react-hooks'

import * as activityTracker from 'services/activityTracker'
import {ActivityEvents} from 'services/activityTracker'

import useTicketActivityTracking from '../useTicketActivityTracking'

jest.mock('services/activityTracker')

describe('useTicketActivityTracking', () => {
    const mockLogActivityEvent = jest.spyOn(activityTracker, 'logActivityEvent')

    it('should register activity tracker hooks when the ticketId is defined', () => {
        const mockRegisterActivityTrackerHooks = jest.spyOn(
            activityTracker,
            'registerActivityTrackerHooks'
        )
        const mockTicketId = 1
        const mockProperties = {
            entityId: mockTicketId,
            entityType: 'ticket',
        }

        renderHook(() => useTicketActivityTracking(mockTicketId))

        expect(mockRegisterActivityTrackerHooks).toHaveBeenCalledWith({
            focusEvent: {
                eventTrigger: ActivityEvents.UserStartedWorkingOnTicket,
                properties: mockProperties,
            },
            blurEvent: {
                eventTrigger: ActivityEvents.UserStoppedWorkingOnTicket,
                properties: mockProperties,
            },
            terminationEvent: {
                eventTrigger: ActivityEvents.UserStoppedWorkingOnTicket,
                properties: mockProperties,
            },
        })
    })

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
