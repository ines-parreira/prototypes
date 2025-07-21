import * as activityTracker from 'services/activityTracker'
import { renderHook } from 'utils/testing/renderHook'

import useActivityTracker from '../useActivityTracker'

jest.mock('services/activityTracker')

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
