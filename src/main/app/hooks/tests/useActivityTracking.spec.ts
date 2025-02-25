import { renderHook } from '@testing-library/react-hooks'

import * as activityTracker from 'services/activityTracker'

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
