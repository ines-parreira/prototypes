import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import useViewCountScheduler from '../useViewCountScheduler'

var mockScheduler: {
    start: jest.Mock
    steal: jest.Mock
    stop: jest.Mock
}

jest.mock('@repo/views', () => ({
    createViewCountScheduler: jest.fn(() => {
        mockScheduler = {
            start: jest.fn(),
            steal: jest.fn(),
            stop: jest.fn(),
        }
        return mockScheduler
    }),
}))

jest.mock('services/socketManager/socketManager', () => ({
    send: jest.fn(),
}))

const useFlagMock = useFlag as jest.Mock

describe('useViewCountScheduler', () => {
    beforeEach(() => {
        useFlagMock.mockReset()
        mockScheduler.start.mockClear()
        mockScheduler.steal.mockClear()
        mockScheduler.stop.mockClear()
        useFlagMock.mockReturnValue(false)
    })

    it('should use the Helpdesk v2 beta flag to gate the scheduler', () => {
        renderHook(() => useViewCountScheduler())

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
        )
    })

    it('should not start the scheduler when the flag is disabled', () => {
        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler when the flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should steal the scheduler on focus', () => {
        useFlagMock.mockReturnValue(true)

        renderHook(() => useViewCountScheduler())
        window.dispatchEvent(new Event('focus'))

        expect(mockScheduler.steal).toHaveBeenCalled()
    })

    it('should stop the scheduler on unmount', () => {
        useFlagMock.mockReturnValue(true)

        const { unmount } = renderHook(() => useViewCountScheduler())
        unmount()

        expect(mockScheduler.stop).toHaveBeenCalled()
    })
})
