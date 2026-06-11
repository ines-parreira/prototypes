import { renderHook } from '@repo/testing'
import {
    createScheduler,
    logViewEvent,
    syncViewedFromUrl,
    useAllViewsLoaded,
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '@repo/views'

import { socketManager } from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import { useIsSocketConnected } from 'services/socketManager/useIsSocketConnected'

import { useViewCountScheduler } from '../useViewCountScheduler'

var mockScheduler: {
    start: jest.Mock
    steal: jest.Mock
    stop: jest.Mock
}

jest.mock('@repo/views', () => ({
    createScheduler: jest.fn(() => mockScheduler),
    logViewEvent: jest.fn(),
    syncViewedFromUrl: jest.fn(),
    useSchedulerConfig: jest.fn(() => ({
        tickIntervalSeconds: 5,
        maxRecentViews: 8,
        ttlSecondsByCount: { 0: 30, 100: 60, 500: 300, 1000: 600 },
        initialFetchTtlSeconds: 3600,
    })),
    useViewCountSchedulerVersion: jest.fn(),
    useAllViewsLoaded: jest.fn(() => true),
    ViewCountSchedulerVersion: { Legacy: 1, V3: 3 },
}))

jest.mock('services/socketManager/socketManager', () => ({
    socketManager: {
        send: jest.fn(),
    },
}))

jest.mock('services/socketManager/useIsSocketConnected', () => ({
    useIsSocketConnected: jest.fn(() => true),
}))

const useViewCountSchedulerVersionMock =
    useViewCountSchedulerVersion as jest.Mock
const useAllViewsLoadedMock = useAllViewsLoaded as jest.Mock
const useIsSocketConnectedMock = useIsSocketConnected as jest.Mock
const createSchedulerV3Mock = createScheduler as jest.Mock
const logViewEventMock = logViewEvent as jest.Mock
const syncViewedFromUrlMock = syncViewedFromUrl as jest.Mock
const socketSendMock = socketManager.send as jest.Mock

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
        useAllViewsLoadedMock.mockReset()
        useAllViewsLoadedMock.mockReturnValue(true)
        useIsSocketConnectedMock.mockReset()
        useIsSocketConnectedMock.mockReturnValue(true)
        createSchedulerV3Mock.mockClear()
        logViewEventMock.mockClear()
        syncViewedFromUrlMock.mockClear()
        socketSendMock.mockClear()
        mockVersion(ViewCountSchedulerVersion.Legacy)
    })

    it('should not start the scheduler when version is Legacy', () => {
        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler when version is V3', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should steal on focus', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        renderHook(() => useViewCountScheduler())
        window.dispatchEvent(new Event('focus'))

        expect(mockScheduler.steal).toHaveBeenCalled()
    })

    it('should stop on unmount', () => {
        mockVersion(ViewCountSchedulerVersion.V3)

        const { unmount } = renderHook(() => useViewCountScheduler())
        unmount()

        expect(mockScheduler.stop).toHaveBeenCalled()
    })

    it('should not start the scheduler while the views list is still loading', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useAllViewsLoadedMock.mockReturnValue(false)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler once the views list finishes loading', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useAllViewsLoadedMock.mockReturnValue(false)

        const { rerender } = renderHook(() => useViewCountScheduler())
        expect(mockScheduler.start).not.toHaveBeenCalled()

        useAllViewsLoadedMock.mockReturnValue(true)
        rerender()

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('should sync the URL view once the views list finishes loading', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useAllViewsLoadedMock.mockReturnValue(false)

        const { rerender } = renderHook(() => useViewCountScheduler())
        expect(syncViewedFromUrlMock).not.toHaveBeenCalled()

        useAllViewsLoadedMock.mockReturnValue(true)
        rerender()

        expect(syncViewedFromUrlMock).toHaveBeenCalledTimes(1)
    })

    it('should not sync the URL view before the views list is loaded', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useAllViewsLoadedMock.mockReturnValue(false)

        renderHook(() => useViewCountScheduler())

        expect(syncViewedFromUrlMock).not.toHaveBeenCalled()
    })

    it('should not start the scheduler while the websocket is disconnected', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useIsSocketConnectedMock.mockReturnValue(false)

        renderHook(() => useViewCountScheduler())

        expect(mockScheduler.start).not.toHaveBeenCalled()
    })

    it('should start the scheduler once the websocket connects', () => {
        mockVersion(ViewCountSchedulerVersion.V3)
        useIsSocketConnectedMock.mockReturnValue(false)

        const { rerender } = renderHook(() => useViewCountScheduler())
        expect(mockScheduler.start).not.toHaveBeenCalled()

        useIsSocketConnectedMock.mockReturnValue(true)
        rerender()

        expect(mockScheduler.start).toHaveBeenCalled()
    })

    it('chunks the fetch-all dispatch into groups of 10 staggered by 500ms with per-chunk log entries', () => {
        jest.useFakeTimers()
        mockVersion(ViewCountSchedulerVersion.V3)
        renderHook(() => useViewCountScheduler())

        const { onFetchAll } = createSchedulerV3Mock.mock.calls[0][0]
        const ids = Array.from({ length: 25 }, (_, i) => i + 1)
        onFetchAll(ids)

        // First chunk fires synchronously, subsequent chunks are scheduled.
        expect(socketSendMock).toHaveBeenCalledTimes(1)
        expect(socketSendMock).toHaveBeenLastCalledWith(
            SocketEventType.ViewsCountExpired,
            { viewIds: ids.slice(0, 10), all: true },
        )
        expect(logViewEventMock).toHaveBeenCalledWith(
            'outbound',
            'views-count-fetch-all-chunk',
            ids.slice(0, 10),
        )

        jest.advanceTimersByTime(500)
        expect(socketSendMock).toHaveBeenCalledTimes(2)
        expect(logViewEventMock).toHaveBeenLastCalledWith(
            'outbound',
            'views-count-fetch-all-chunk',
            ids.slice(10, 20),
        )

        jest.advanceTimersByTime(500)
        expect(socketSendMock).toHaveBeenCalledTimes(3)
        expect(logViewEventMock).toHaveBeenLastCalledWith(
            'outbound',
            'views-count-fetch-all-chunk',
            ids.slice(20, 25),
        )

        // No further chunks pending.
        jest.advanceTimersByTime(500)
        expect(socketSendMock).toHaveBeenCalledTimes(3)
        expect(logViewEventMock).toHaveBeenCalledTimes(3)

        jest.useRealTimers()
    })
})
