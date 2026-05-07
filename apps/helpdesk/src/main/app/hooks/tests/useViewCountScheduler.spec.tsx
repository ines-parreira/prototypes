import { renderHook } from '@repo/testing'
import { useHasNewViewCountScheduler } from '@repo/views'

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
    useHasNewViewCountScheduler: jest.fn(),
}))

jest.mock('services/socketManager/socketManager', () => ({
    send: jest.fn(),
}))

const useHasNewViewCountSchedulerMock = useHasNewViewCountScheduler as jest.Mock

function mockHasNewScheduler(value: boolean) {
    useHasNewViewCountSchedulerMock.mockReturnValue({ value, isLoading: false })
}

describe('useViewCountScheduler', () => {
    beforeEach(() => {
        useHasNewViewCountSchedulerMock.mockReset()
        mockScheduler.start.mockClear()
        mockScheduler.steal.mockClear()
        mockScheduler.stop.mockClear()
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
