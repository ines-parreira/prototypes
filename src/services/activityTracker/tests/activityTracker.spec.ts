import BrowserEventTracker from '@gorgias/event-tracker-browser'
import {waitFor} from '@testing-library/react'

import {AGENT_ACTIVITY_HEALTHCHECK_INTERVAL, ActivityEvents} from '../constants'

jest.mock('../utils', () => {
    return {
        checkIfTrackerIsEnabled: jest.fn().mockReturnValue(true),
    }
})

describe('activityTracker', () => {
    let activityTracker: typeof import('../activityTracker')
    beforeEach(async () => {
        document.hasFocus = jest.fn(() => true)

        return import('../activityTracker').then((module) => {
            jest.resetModules()
            activityTracker = module
        })
    })

    it('should return an instance of BrowserEventTracker', () => {
        expect(activityTracker.default).toBeInstanceOf(BrowserEventTracker)
    })

    it('should log an event', async () => {
        const logEventSpy = jest.spyOn(activityTracker.default, 'logEvent')
        activityTracker.logActivityEvent(
            ActivityEvents.UserStartedDraftingTicket
        )

        await waitFor(() => {
            expect(logEventSpy).toHaveBeenCalledWith(
                ActivityEvents.UserStartedDraftingTicket
            )
        })
    })

    it('should register activity browser event hooks', async () => {
        const registerBrowserHooksSpy = jest.spyOn(
            activityTracker.default,
            'registerBrowserHooks'
        )
        await activityTracker.registerActivityTrackerHooks({
            startEvent: {
                eventTrigger: ActivityEvents.UserCreatedTicket,
            },
        })

        expect(registerBrowserHooksSpy).toHaveBeenCalledWith({
            startEvent: {
                eventTrigger: ActivityEvents.UserCreatedTicket,
            },
        })
    })

    it('should unregister activity browser event hooks', async () => {
        const mockUnregisterReturn = jest.fn()
        const registerBrowserHooksSpy = jest.spyOn(
            activityTracker.default,
            'registerBrowserHooks'
        )
        registerBrowserHooksSpy.mockReturnValue(mockUnregisterReturn)

        const unregister = await activityTracker.registerActivityTrackerHooks({
            startEvent: {
                eventTrigger: ActivityEvents.UserCreatedTicket,
            },
        })
        unregister?.()

        expect(mockUnregisterReturn).toHaveBeenCalled()
    })

    it('should register app activity browser event hooks', async () => {
        const registerBrowserHooksSpy = jest.spyOn(
            activityTracker.default,
            'registerBrowserHooks'
        )
        await activityTracker.registerAppActivityTrackerHooks()

        expect(registerBrowserHooksSpy).toHaveBeenCalledWith({
            startEvent: {
                eventTrigger: ActivityEvents.UserOpenedApp,
            },
            terminationEvent: {
                eventTrigger: ActivityEvents.UserClosedApp,
            },
            focusEvent: {
                eventTrigger: ActivityEvents.UserOpenedApp,
            },
            blurEvent: {
                eventTrigger: ActivityEvents.UserClosedApp,
            },
        })
    })

    it('should unregister app activity browser event hooks', async () => {
        const mockUnregisterReturn = jest.fn()
        const registerBrowserHooksSpy = jest.spyOn(
            activityTracker.default,
            'registerBrowserHooks'
        )
        registerBrowserHooksSpy.mockReturnValue(mockUnregisterReturn)

        await activityTracker.registerAppActivityTrackerHooks()
        await activityTracker.unregisterAppActivityTrackerHooks()

        expect(mockUnregisterReturn).toHaveBeenCalled()
    })

    it('should not perform a healthcheck if the window is not focused', async () => {
        const eventTrackerLogEventSpy = jest.spyOn(
            activityTracker.default,
            'logEvent'
        )
        document.hasFocus = jest.fn(() => false)
        jest.useFakeTimers()

        await activityTracker.registerAppActivityTrackerHooks()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).not.toHaveBeenCalled()
    })

    it('should perform a healthcheck every AGENT_ACTIVITY_HEALTHCHECK_INTERVAL', async () => {
        const eventTrackerLogEventSpy = jest.spyOn(
            activityTracker.default,
            'logEvent'
        )
        jest.useFakeTimers()
        await activityTracker.registerAppActivityTrackerHooks()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerLogEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive
        )
    })

    it('should stop the healthcheck', async () => {
        const eventTrackerLogEventSpy = jest.spyOn(
            activityTracker.default,
            'logEvent'
        )
        jest.useFakeTimers()

        await activityTracker.registerAppActivityTrackerHooks()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerLogEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive
        )

        eventTrackerLogEventSpy.mockClear()
        await activityTracker.unregisterAppActivityTrackerHooks()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).not.toHaveBeenCalled()
    })

    it('should clear activity tracker session', async () => {
        const clearSessionSpy = jest.spyOn(
            activityTracker.default,
            'clearSession'
        )
        await activityTracker.clearActivityTrackerSession()
        expect(clearSessionSpy).toHaveBeenCalled()
    })
})
