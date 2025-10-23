import { renderHook } from '@testing-library/react'

import { CoreProvider, useCoreContext } from '../CoreContext'

jest.mock('../../hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: jest.fn(() => ({
        httpIntegrationId: 123,
        baseUrl: 'https://test-base-url.com',
    })),
}))

jest.mock('../../hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: jest.fn(() => ({
        channel: 'email',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
    })),
}))

jest.mock('../../hooks/useTestSession', () => ({
    useTestSession: jest.fn(() => ({
        testSessionId: 'test-session-123',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
    })),
}))

jest.mock('../../hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: jest.fn(() => ({
        testSessionLogs: {
            id: 'test-session-123',
            status: 'idle',
            logs: [],
        },
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    })),
}))

describe('CoreContext (PlaygroundStateContext)', () => {
    describe('usePlaygroundStateContext', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useCoreContext())
            }).toThrow(
                'usePlaygroundStateContext must be used within PlaygroundStateProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value when used inside provider', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current).toBeDefined()
            expect(result.current.testSessionId).toBe('test-session-123')
            expect(result.current.isTestSessionLoading).toBe(false)
            expect(result.current.isPolling).toBe(false)
            expect(result.current.channel).toBe('email')
            expect(result.current.channelAvailability).toBe('online')
        })

        it('should include test session state', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.testSessionId).toBe('test-session-123')
            expect(result.current.isTestSessionLoading).toBe(false)
        })

        it('should include polling state', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.testSessionLogs).toBeDefined()
            expect(result.current.isPolling).toBe(false)
            expect(typeof result.current.startPolling).toBe('function')
            expect(typeof result.current.stopPolling).toBe('function')
        })

        it('should include channel state', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.channel).toBe('email')
            expect(result.current.channelAvailability).toBe('online')
            expect(typeof result.current.onChannelChange).toBe('function')
            expect(typeof result.current.onChannelAvailabilityChange).toBe(
                'function',
            )
        })
    })

    describe('PlaygroundStateProvider', () => {
        it('should pass arePlaygroundActionsAllowed to useTestSession', () => {
            const useTestSession = require('../../hooks/useTestSession')
                .useTestSession as jest.Mock

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider arePlaygroundActionsAllowed={true}>
                        {children}
                    </CoreProvider>
                ),
            })

            expect(useTestSession).toHaveBeenCalledWith(
                'https://test-base-url.com',
                expect.objectContaining({
                    areActionsAllowedToExecute: true,
                }),
            )
        })

        it('should default arePlaygroundActionsAllowed to false when not provided', () => {
            const useTestSession = require('../../hooks/useTestSession')
                .useTestSession as jest.Mock

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(useTestSession).toHaveBeenCalledWith(
                'https://test-base-url.com',
                expect.objectContaining({
                    areActionsAllowedToExecute: false,
                }),
            )
        })

        it('should pass testSessionId and baseUrl to usePlaygroundPolling', () => {
            const usePlaygroundPolling =
                require('../../hooks/usePlaygroundPolling')
                    .usePlaygroundPolling as jest.Mock

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(usePlaygroundPolling).toHaveBeenCalledWith({
                testSessionId: 'test-session-123',
                baseUrl: 'https://test-base-url.com',
            })
        })

        it('should handle null testSessionId', () => {
            const useTestSession = require('../../hooks/useTestSession')
                .useTestSession as jest.Mock
            const usePlaygroundPolling =
                require('../../hooks/usePlaygroundPolling')
                    .usePlaygroundPolling as jest.Mock

            useTestSession.mockReturnValueOnce({
                testSessionId: null,
                isTestSessionLoading: false,
                createTestSession: jest.fn(),
            })

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(usePlaygroundPolling).toHaveBeenCalledWith({
                testSessionId: undefined,
                baseUrl: 'https://test-base-url.com',
            })
        })
    })
})
