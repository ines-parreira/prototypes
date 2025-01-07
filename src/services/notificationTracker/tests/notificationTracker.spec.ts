import EventTracker from '@gorgias/event-tracker-api'
import {waitFor} from '@testing-library/react'

import {NotificationEvent} from '../constants'

jest.mock('../utils', () => {
    return {
        checkIfAiAgentOnboardingNotificationIsEnabled: jest
            .fn()
            .mockReturnValue(true),
    }
})

describe('notificationTracker', () => {
    let notificationTracker: typeof import('../notificationTracker')
    beforeEach(async () => {
        document.hasFocus = jest.fn(() => true)

        return import('../notificationTracker').then((module) => {
            jest.resetModules()
            notificationTracker = module
        })
    })

    it('should return an instance of EventTracker', () => {
        expect(notificationTracker.default).toBeInstanceOf(EventTracker)
    })

    it('should log an event', async () => {
        const logEventSpy = jest.spyOn(notificationTracker.default, 'logEvent')
        notificationTracker.logNotificationEvent(NotificationEvent)

        await waitFor(() => {
            expect(logEventSpy).toHaveBeenCalledWith(NotificationEvent)
        })
    })
})
