import * as activityTracker from 'services/activityTracker'
import { ActivityEvents } from 'services/activityTracker'
import { renderHook } from 'utils/testing/renderHook'

import useDraftTicketActivityTracking from '../useDraftTicketActivityTracking'

jest.mock('services/activityTracker')

describe('useDraftTicketActivityTracking', () => {
    const mockLogActivityEvent = jest.spyOn(activityTracker, 'logActivityEvent')

    it('should register activity tracker hooks when the temporaryId is defined', () => {
        const mockRegisterActivityTrackerHooks = jest.spyOn(
            activityTracker,
            'registerActivityTrackerHooks',
        )
        const mockTemporaryId = '1'
        const mockProperties = {
            temporaryId: mockTemporaryId,
            entityType: 'ticket-draft',
        }

        renderHook(() => useDraftTicketActivityTracking(mockTemporaryId))

        expect(mockRegisterActivityTrackerHooks).toHaveBeenCalledWith({
            focusEvent: {
                eventTrigger: ActivityEvents.UserStartedDraftingTicket,
                properties: mockProperties,
            },
            blurEvent: {
                eventTrigger: ActivityEvents.UserStoppedDraftingTicket,
                properties: mockProperties,
            },
            terminationEvent: {
                eventTrigger: ActivityEvents.UserStoppedDraftingTicket,
                properties: mockProperties,
            },
        })
    })

    it('should log an event when the temporaryId is defined', () => {
        const mockTemporaryId = '1'

        const { unmount } = renderHook(() =>
            useDraftTicketActivityTracking(mockTemporaryId),
        )

        expect(mockLogActivityEvent).toHaveBeenLastCalledWith(
            ActivityEvents.UserStartedDraftingTicket,
            {
                temporaryId: mockTemporaryId,
                entityType: 'ticket-draft',
            },
        )

        unmount()

        expect(mockLogActivityEvent).toHaveBeenLastCalledWith(
            ActivityEvents.UserStoppedDraftingTicket,
            {
                temporaryId: mockTemporaryId,
                entityType: 'ticket-draft',
            },
        )
    })

    it('should not log an event when the temporaryId is null on mount', () => {
        const { unmount } = renderHook(() =>
            useDraftTicketActivityTracking(null),
        )
        expect(mockLogActivityEvent).not.toHaveBeenCalled()

        unmount()

        expect(mockLogActivityEvent).not.toHaveBeenCalled()
    })
})
