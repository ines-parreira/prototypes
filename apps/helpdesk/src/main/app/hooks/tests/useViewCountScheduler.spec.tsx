import { renderHook } from '@repo/testing'
import type { RefreshConfig } from '@repo/views'
import {
    useSchedulerConfig,
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '@repo/views'

import useViewCountScheduler from '../useViewCountScheduler'

var mockScheduler: {
    start: jest.Mock
    steal: jest.Mock
    stop: jest.Mock
}

jest.mock('@repo/views', () => ({
    createViewCountScheduler: jest.fn(() => mockScheduler),
    setActiveViewFallback: jest.fn(),
    useDefaultView: jest.fn(),
    useViewCountSchedulerVersion: jest.fn(),
    ViewCountSchedulerVersion: { Legacy: 1, V2: 2, V3: 3 },
    useSchedulerConfig: jest.fn(),
}))

jest.mock('services/socketManager/socketManager', () => ({
    send: jest.fn(),
}))

const useViewCountSchedulerVersionMock =
    useViewCountSchedulerVersion as jest.Mock
const useSchedulerConfigMock = useSchedulerConfig as jest.Mock

const fakeConfig: RefreshConfig = {
    tickIntervalSeconds: 30,
    minRefreshIntervalSeconds: 300,
    maxViewsPerTick: 5,
    maxRealtimePerTick: 2,
    initialMaxViews: 20,
    largeCountThreshold: 1000,
    recentlyActiveWindowSeconds: 300,
    staleSeconds: 600,
}

function mockVersion(version: ViewCountSchedulerVersion) {
    useViewCountSchedulerVersionMock.mockReturnValue({
        version,
        isLoading: false,
    })
}

describe('useViewCountScheduler', () => {
    beforeEach(() => {
        mockScheduler = {
            start: jest.fn(),
            steal: jest.fn(),
            stop: jest.fn(),
        }
        useViewCountSchedulerVersionMock.mockReset()
        useSchedulerConfigMock.mockReset()
        useSchedulerConfigMock.mockReturnValue(fakeConfig)
        mockVersion(ViewCountSchedulerVersion.Legacy)
    })

    it('should not start the scheduler when version is Legacy', () => {
        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should not start the scheduler when version is V3', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler when version is V2', () => {
        mockVersion(ViewCountSchedulerVersion.V2)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should steal the scheduler on focus', () => {
        mockVersion(ViewCountSchedulerVersion.V2)

        renderHook(() => useViewCountScheduler())
        window.dispatchEvent(new Event('focus'))

        expect(mockScheduler.steal).toHaveBeenCalled()
    })

    it('should stop the scheduler on unmount', () => {
        mockVersion(ViewCountSchedulerVersion.V2)

        const { unmount } = renderHook(() => useViewCountScheduler())
        unmount()

        expect(mockScheduler.stop).toHaveBeenCalled()
    })
})
