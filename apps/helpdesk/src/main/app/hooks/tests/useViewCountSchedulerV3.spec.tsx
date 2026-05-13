import { renderHook } from '@repo/testing'
import {
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '@repo/views'

import useViewCountSchedulerV3 from '../useViewCountSchedulerV3'

var mockScheduler: {
    start: jest.Mock
    steal: jest.Mock
    stop: jest.Mock
}

jest.mock('@repo/views', () => ({
    createSchedulerV3: jest.fn(() => mockScheduler),
    useSchedulerConfigV3: jest.fn(() => ({
        tickIntervalSeconds: 5,
        maxRecentViews: 8,
        ttlSecondsByCount: { 0: 30, 100: 60, 500: 300, 1000: 600 },
        fetchAllMinCooldownSeconds: 3600,
    })),
    useViewCountSchedulerVersion: jest.fn(),
    ViewCountSchedulerVersion: { Legacy: 1, V2: 2, V3: 3 },
}))

jest.mock('services/socketManager/socketManager', () => ({
    send: jest.fn(),
}))

const useViewCountSchedulerVersionMock =
    useViewCountSchedulerVersion as jest.Mock

function mockVersion(version: ViewCountSchedulerVersion) {
    useViewCountSchedulerVersionMock.mockReturnValue({
        version,
        isLoading: false,
    })
}

describe('useViewCountSchedulerV3', () => {
    beforeEach(() => {
        mockScheduler = {
            start: jest.fn(),
            steal: jest.fn(),
            stop: jest.fn(),
        }
        useViewCountSchedulerVersionMock.mockReset()
        mockVersion(ViewCountSchedulerVersion.Legacy)
    })

    it('should not start the scheduler when version is Legacy', () => {
        renderHook(() => useViewCountSchedulerV3())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should not start the scheduler when version is V2', () => {
        mockVersion(ViewCountSchedulerVersion.V2)

        renderHook(() => useViewCountSchedulerV3())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler when version is V3', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        renderHook(() => useViewCountSchedulerV3())

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should steal on focus', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        renderHook(() => useViewCountSchedulerV3())
        window.dispatchEvent(new Event('focus'))

        expect(mockScheduler.steal).toHaveBeenCalled()
    })

    it('should stop on unmount', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        const { unmount } = renderHook(() => useViewCountSchedulerV3())
        unmount()

        expect(mockScheduler.stop).toHaveBeenCalled()
    })
})
