import {renderHook} from '@testing-library/react-hooks'

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
            'registerActivityTrackerHooks'
        )
        renderHook(() => useActivityTracker())

        expect(registerActivityTrackerSpy).toHaveBeenCalled()
    })

    it('should unregister activity tracker', () => {
        const unregisterActivityTrackerSpy = jest.spyOn(
            activityTracker,
            'unregisterActivityTrackerHooks'
        )
        renderHook(() => useActivityTracker()).unmount()

        expect(unregisterActivityTrackerSpy).toHaveBeenCalled()
    })
})
