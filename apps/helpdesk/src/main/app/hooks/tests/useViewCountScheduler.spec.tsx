import { renderHook } from '@repo/testing'
import type { RefreshConfig } from '@repo/views'
import { useHasNewViewCountScheduler, useSchedulerConfig } from '@repo/views'

import useViewCountScheduler from '../useViewCountScheduler'

var mockScheduler: {
    start: jest.Mock
    steal: jest.Mock
    stop: jest.Mock
}

jest.mock('@repo/views', () => ({
    createViewCountScheduler: jest.fn(() => mockScheduler),
    useHasNewViewCountScheduler: jest.fn(),
    useSchedulerConfig: jest.fn(),
}))

jest.mock('services/socketManager/socketManager', () => ({
    send: jest.fn(),
}))

const useHasNewViewCountSchedulerMock = useHasNewViewCountScheduler as jest.Mock
const useSchedulerConfigMock = useSchedulerConfig as jest.Mock

const fakeConfig: RefreshConfig = {
    tickIntervalSeconds: 30,
    minRefreshIntervalSeconds: 300,
    maxViewsPerTick: 5,
    maxRealtimePerTick: 2,
    largeCountThreshold: 100,
    recentlyActiveWindowSeconds: 300,
    staleSeconds: 600,
}

function mockHasNewScheduler(value: boolean) {
    useHasNewViewCountSchedulerMock.mockReturnValue({ value, isLoading: false })
}

describe('useViewCountScheduler', () => {
    beforeEach(() => {
        mockScheduler = {
            start: jest.fn(),
            steal: jest.fn(),
            stop: jest.fn(),
        }
        useHasNewViewCountSchedulerMock.mockReset()
        useSchedulerConfigMock.mockReset()
        useSchedulerConfigMock.mockReturnValue(fakeConfig)
        mockHasNewScheduler(false)
    })

    it('should not start the scheduler when the new UI is disabled', () => {
        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler when the new UI is enabled', () => {
        mockHasNewScheduler(true)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should steal the scheduler on focus', () => {
        mockHasNewScheduler(true)

        renderHook(() => useViewCountScheduler())
        window.dispatchEvent(new Event('focus'))

        expect(mockScheduler.steal).toHaveBeenCalled()
    })

    it('should stop the scheduler on unmount', () => {
        mockHasNewScheduler(true)

        const { unmount } = renderHook(() => useViewCountScheduler())
        unmount()

        expect(mockScheduler.stop).toHaveBeenCalled()
    })
})
