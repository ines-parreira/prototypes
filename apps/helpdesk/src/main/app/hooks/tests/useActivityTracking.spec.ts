import * as activityTracker from '@repo/activity-tracker'
import { renderHook } from '@repo/testing'

import { useActivityTracker } from '../useActivityTracker'

jest.mock('@repo/activity-tracker')

describe('useActivityTracking', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should register activity tracker', () => {
        const registerActivityTrackerSpy = jest.spyOn(
            activityTracker,
            'registerAppActivityTrackerHooks',
        )
        renderHook(() => useActivityTracker())

        expect(registerActivityTrackerSpy).toHaveBeenCalled()
    })

    it('should unregister activity tracker', () => {
        const unregisterActivityTrackerSpy = jest.spyOn(
            activityTracker,
            'unregisterAppActivityTrackerHooks',
        )
        renderHook(() => useActivityTracker()).unmount()

        expect(unregisterActivityTrackerSpy).toHaveBeenCalled()
    })
})
