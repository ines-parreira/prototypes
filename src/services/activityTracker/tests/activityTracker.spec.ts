import BrowserEventTracker from '@gorgias/event-tracker-browser'

import {AGENT_ACTIVITY_HEALTHCHECK_INTERVAL, ActivityEvents} from '../constants'

describe('activityTracker', () => {
    let activityTracker: typeof import('../activityTracker')
    beforeEach(async () => {
        return import('../activityTracker').then((module) => {
            jest.resetModules()
            activityTracker = module
        })
    })

    it('should return an instance of BrowserEventTracker', () => {
        expect(activityTracker.default).toBeInstanceOf(BrowserEventTracker)
    })

    it('should perform a healthcheck every AGENT_ACTIVITY_HEALTHCHECK_INTERVAL', () => {
        const eventTrackerSpy = jest.spyOn(activityTracker.default, 'logEvent')
        jest.useFakeTimers()
        activityTracker.startActivityHealthCheck()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive
        )
    })

    it('should stop the healthcheck', () => {
        const eventTrackerSpy = jest.spyOn(activityTracker.default, 'logEvent')
        jest.useFakeTimers()

        activityTracker.startActivityHealthCheck()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerSpy).toHaveBeenCalledTimes(1)
        expect(eventTrackerSpy).toHaveBeenCalledWith(
            ActivityEvents.UserIsActive
        )

        eventTrackerSpy.mockClear()
        activityTracker.stopActivityHealthCheck()
        jest.advanceTimersByTime(AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)

        expect(eventTrackerSpy).not.toHaveBeenCalled()
    })
})
