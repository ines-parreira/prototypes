import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    CONNECTION_ACTIVITY_WATCH_THROTTLING,
    CONNECTION_UNAVAILABILITY_TIMEOUT,
    useAccountConnectionActivity,
} from '../useAccountConnectionActivity'

const updatePresenceDataMock = jest.fn()

describe('useAccountConnectionActivity', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        updatePresenceDataMock.mockResolvedValue(undefined)
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('updates presence to inactive after the connection active timeout', () => {
        renderHook(() => useAccountConnectionActivity(updatePresenceDataMock))

        act(() => {
            jest.advanceTimersByTime(CONNECTION_UNAVAILABILITY_TIMEOUT - 1)
        })

        expect(updatePresenceDataMock).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(1)
        })

        expect(updatePresenceDataMock).toHaveBeenCalledTimes(1)
        expect(updatePresenceDataMock).toHaveBeenCalledWith({
            connectionActive: false,
        })
    })

    it('keeps presence active while activity resets the timeout', () => {
        renderHook(() => useAccountConnectionActivity(updatePresenceDataMock))

        act(() => {
            jest.advanceTimersByTime(CONNECTION_ACTIVITY_WATCH_THROTTLING)
            document.dispatchEvent(new Event('mousemove'))
            jest.advanceTimersByTime(CONNECTION_UNAVAILABILITY_TIMEOUT - 1)
        })

        expect(updatePresenceDataMock).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(1)
        })

        expect(updatePresenceDataMock).toHaveBeenCalledTimes(1)
        expect(updatePresenceDataMock).toHaveBeenCalledWith({
            connectionActive: false,
        })
    })

    it('updates presence to active when activity resumes after inactivity', () => {
        renderHook(() => useAccountConnectionActivity(updatePresenceDataMock))

        act(() => {
            jest.advanceTimersByTime(CONNECTION_UNAVAILABILITY_TIMEOUT)
        })

        expect(updatePresenceDataMock).toHaveBeenCalledWith({
            connectionActive: false,
        })

        act(() => {
            jest.advanceTimersByTime(CONNECTION_ACTIVITY_WATCH_THROTTLING)
            document.dispatchEvent(new Event('keydown'))
        })

        expect(updatePresenceDataMock).toHaveBeenLastCalledWith({
            connectionActive: true,
        })
        expect(updatePresenceDataMock).toHaveBeenCalledTimes(2)
    })

    it('removes browser activity listeners and clears the timeout on unmount', () => {
        const { unmount } = renderHook(() =>
            useAccountConnectionActivity(updatePresenceDataMock),
        )

        unmount()

        act(() => {
            document.dispatchEvent(new Event('mousemove'))
            jest.advanceTimersByTime(CONNECTION_UNAVAILABILITY_TIMEOUT)
        })

        expect(updatePresenceDataMock).not.toHaveBeenCalled()
    })
})
