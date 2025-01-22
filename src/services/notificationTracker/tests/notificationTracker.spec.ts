import EventTracker from '@gorgias/event-tracker-api'
import {waitFor} from '@testing-library/react'

import {UserRole} from 'config/types/user'
import {GorgiasInitialState} from 'types'

import {NotificationEvent} from '../constants'

jest.mock('../utils', () => {
    return {
        checkIfAiAgentOnboardingNotificationIsEnabled: jest
            .fn()
            .mockReturnValue(true),
    }
})

window.GORGIAS_STATE = {
    currentAccount: {id: 123},
    agents: {
        all: [
            {id: 3, role: {name: UserRole.Admin}},
            {id: 2, role: {name: UserRole.Agent}},
            {id: 1, role: {name: UserRole.Admin}},
        ],
    },
} as GorgiasInitialState

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

    it('should get admin ids recipient list in sorted order', () => {
        const adminIdsList = notificationTracker.getAdminRecipientIds()

        expect(adminIdsList).toEqual([
            {
                id: '123.1',
            },
            {
                id: '123.3',
            },
        ])
    })
})
