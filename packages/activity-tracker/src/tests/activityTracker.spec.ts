import BrowserEventTracker from '@gorgias/event-tracker-browser'

import {
    ActivityEvents,
    AGENT_ACTIVITY_HEALTHCHECK_INTERVAL,
} from '../constants'

type ActivityTrackerModule = typeof import('../activityTracker')

vi.mock('../utils', () => {
    return {
        checkIfTrackerIsEnabled: vi.fn().mockResolvedValue(true),
    }
})

describe('activityTracker', () => {
    let activityTracker: ActivityTrackerModule

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.resetModules()
        document.hasFocus = vi.fn(() => true)
        activityTracker = await import('../activityTracker')
    })

    afterEach(async () => {
        await activityTracker.unregisterAppActivityTrackerHooks()
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('should return an instance of BrowserEventTracker', () => {
        expect(activityTracker.default.constructor.name).toBe(
            BrowserEventTracker.name,
        )
    })

    it('should log an event', async () => {
        const logEventSpy = vi
            .spyOn(activityTracker.default, 'logEvent')
            .mockImplementation(() => undefined)
        activityTracker.logActivityEvent(
            ActivityEvents.UserStartedDraftingTicket,
        )

        await vi.waitFor(() => {
            expect(logEventSpy).toHaveBeenCalledWith(
                ActivityEvents.UserStartedDraftingTicket,
            )
        })
    })

    it('should register activity browser event hooks', async () => {
        const registerBrowserHooksSpy = vi.spyOn(
            activityTracker.default,
            'registerBrowserHooks',
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
        const mockUnregisterReturn = vi.fn()
        const registerBrowserHooksSpy = vi.spyOn(
            activityTracker.default,
            'registerBrowserHooks',
        )
        registerBrowserHooksSpy.mockReturnValue(mockUnregisterReturn as never)

        const unregister = await activityTracker.registerActivityTrackerHooks({
            startEvent: {
                eventTrigger: ActivityEvents.UserCreatedTicket,
            },
        })
        unregister?.()

        expect(mockUnregisterReturn).toHaveBeenCalled()
    })

    it('should register app activity browser event hooks', async () => {
        const registerBrowserHooksSpy = vi.spyOn(
            activityTracker.default,
            'registerBrowserHooks',
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
        const mockUnregisterReturn = vi.fn()
        const registerBrowserHooksSpy = vi.spyOn(
            activityTracker.default,
            'registerBrowserHooks',
        )
        registerBrowserHooksSpy.mockReturnValue(mockUnregisterReturn as never)

        await activityTracker.registerAppActivityTrackerHooks()
        await activityTracker.unregisterAppActivityTrackerHooks()

        expect(mockUnregisterReturn).toHaveBeenCalled()
    })

    it('should not perform a healthcheck if the window is not focused', async () => {
        const eventTrackerLogEventSpy = vi
            .spyOn(activityTracker.default, 'logEvent')
            .mockImplementation(() => undefined)
        document.hasFocus = vi.fn(() => false)
        vi.useFakeTimers()

        await activityTracker.registerAppActivityTrackerHooks()
        vi.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).not.toHaveBeenCalled()
    })

    it('should perform a healthcheck every AGENT_ACTIVITY_HEALTHCHECK_INTERVAL', async () => {
        const eventTrackerLogEventSpy = vi
            .spyOn(activityTracker.default, 'logEvent')
            .mockImplementation(() => undefined)
        vi.useFakeTimers()
        await activityTracker.registerAppActivityTrackerHooks()
        vi.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerLogEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive,
        )
    })

    it('should stop the healthcheck', async () => {
        const eventTrackerLogEventSpy = vi
            .spyOn(activityTracker.default, 'logEvent')
            .mockImplementation(() => undefined)
        vi.useFakeTimers()

        await activityTracker.registerAppActivityTrackerHooks()
        vi.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerLogEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive,
        )

        eventTrackerLogEventSpy.mockClear()
        await activityTracker.unregisterAppActivityTrackerHooks()
        vi.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerLogEventSpy).not.toHaveBeenCalled()
    })

    it('should clear activity tracker session', async () => {
        const clearSessionSpy = vi.spyOn(
            activityTracker.default,
            'clearSession',
        )
        await activityTracker.clearActivityTrackerSession()
        expect(clearSessionSpy).toHaveBeenCalled()
    })
})
