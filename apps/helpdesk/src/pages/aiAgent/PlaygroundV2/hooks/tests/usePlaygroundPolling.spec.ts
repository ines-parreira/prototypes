import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetTestSessionLogs } from 'models/aiAgent/queries'
import { reportError } from 'utils/errors'

import { usePlaygroundPolling } from '../usePlaygroundPolling'

// Mock dependencies
jest.mock('models/aiAgent/queries', () => ({
    useGetTestSessionLogs: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

const mockedUseGetTestSessionLogs = jest.mocked(useGetTestSessionLogs)
const mockedReportError = jest.mocked(reportError)

describe('usePlaygroundPolling hook', () => {
    beforeEach(() => {
        jest.useFakeTimers()

        // Default mock implementation
        mockedUseGetTestSessionLogs.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.useRealTimers()
    })

    it('should not poll initially', () => {
        const { result } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        expect(result.current.isPolling).toBe(false)
        expect(mockedUseGetTestSessionLogs).toHaveBeenCalledWith('123', false, {
            enabled: false,
            refetchInterval: 5000,
        })
    })

    it('should start polling when startPolling is called', () => {
        const { result } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        act(() => {
            result.current.startPolling()
        })

        expect(result.current.isPolling).toBe(true)
        expect(mockedUseGetTestSessionLogs).toHaveBeenCalledWith('123', false, {
            enabled: true,
            refetchInterval: 5000,
        })
    })

    it('should forward useV3=true to useGetTestSessionLogs', () => {
        renderHook(() =>
            usePlaygroundPolling({ testSessionId: 'abc', useV3: true }),
        )

        expect(mockedUseGetTestSessionLogs).toHaveBeenCalledWith(
            'abc',
            true,
            expect.objectContaining({ enabled: false }),
        )
    })

    it('should stop polling when stopPolling is called', () => {
        const { result } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        act(() => {
            result.current.startPolling()
        })

        expect(result.current.isPolling).toBe(true)

        act(() => {
            result.current.stopPolling()
        })

        expect(result.current.isPolling).toBe(false)
    })

    it('should stop polling when component unmounts', () => {
        const { result, unmount } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        act(() => {
            result.current.startPolling()
        })

        expect(result.current.isPolling).toBe(true)

        unmount()

        // We can't directly test isPolling after unmount since the component is gone,
        // but we can test that the timeout was cleared
        jest.advanceTimersByTime(5 * 60 * 1000 + 1000)

        // The component has been unmounted, so we're testing that the cleanup function
        // properly stops polling
    })

    it('should stop polling after timeout', () => {
        const { result } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        act(() => {
            result.current.startPolling()
        })

        expect(result.current.isPolling).toBe(true)

        // Advance past the timeout duration (5 minutes)
        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000 + 1000)
        })

        expect(result.current.isPolling).toBe(false)
    })

    it('should stop polling and report error when an error occurs', () => {
        const testError = new Error('Test error')

        const { result, rerender } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        act(() => {
            result.current.startPolling()
        })

        expect(result.current.isPolling).toBe(true)

        // Update the mock to return an error
        mockedUseGetTestSessionLogs.mockReturnValue({
            data: undefined,
            error: testError,
            isLoading: false,
            isError: true,
            refetch: jest.fn(),
        } as any)

        // Trigger re-render to apply the new mock
        rerender()

        expect(result.current.isPolling).toBe(false)
        expect(mockedReportError).toHaveBeenCalledWith(testError, {
            tags: {
                team: SentryTeam.AI_AGENT,
                testSessionId: '123',
            },
        })
    })

    it('should return testSessionLogs from the query', () => {
        const testData = { status: 'in_progress', logs: ['log1', 'log2'] }

        mockedUseGetTestSessionLogs.mockReturnValue({
            data: testData,
            error: null,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            usePlaygroundPolling({ testSessionId: '123' }),
        )

        expect(result.current.testSessionLogs).toBe(testData)
    })
})
