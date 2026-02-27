import { useSearchParams } from '@repo/routing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { CoreProvider, useCoreContext } from '../CoreContext'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('../../hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: jest.fn(() => ({
        httpIntegrationId: 123,
        baseUrl: 'https://test-base-url.com',
    })),
}))

const mockResetToDefaultChannel = jest.fn()
jest.mock('../../hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: jest.fn(() => ({
        channel: 'email',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
        resetToDefaultChannel: mockResetToDefaultChannel,
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

const mockIsDraftKnowledgeReady = jest.fn(() => true)
jest.mock('../../hooks/useDraftKnowledge', () => ({
    useDraftKnowledgeSync: jest.fn(() => ({
        isDraftKnowledgeReady: mockIsDraftKnowledgeReady(),
    })),
}))

describe('CoreContext (PlaygroundStateContext)', () => {
    const mockedUseSearchParams = jest.mocked(useSearchParams)
    const mockSetSearchParams = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseSearchParams.mockReturnValue([
            new URLSearchParams(),
            mockSetSearchParams,
        ])
        mockResetToDefaultChannel.mockClear()
        mockIsDraftKnowledgeReady.mockReturnValue(true)
    })

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
            expect(result.current.areActionsEnabled).toBe(false)
            expect(typeof result.current.setAreActionsEnabled).toBe('function')
            expect(typeof result.current.resetToDefaultActionsEnabled).toBe(
                'function',
            )
            expect(typeof result.current.resetToDefaultChannel).toBe('function')
        })

        it('should include test session state', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.testSessionId).toBe('test-session-123')
            expect(result.current.isTestSessionLoading).toBe(false)
            expect(typeof result.current.createTestSession).toBe('function')
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
                false,
                undefined,
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
                false,
                undefined,
            )
        })

        it('should pass external session id from search params to useTestSession', () => {
            const useTestSession = require('../../hooks/useTestSession')
                .useTestSession as jest.Mock

            mockedUseSearchParams.mockReturnValue([
                new URLSearchParams('session-id=external-session-123'),
                mockSetSearchParams,
            ])

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
                false,
                'external-session-123',
            )
        })

        it('should populate session-id in search params when testSessionId exists', async () => {
            mockedUseSearchParams.mockReturnValue([
                new URLSearchParams('use-v3=true'),
                mockSetSearchParams,
            ])

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            await waitFor(() => {
                expect(mockSetSearchParams).toHaveBeenCalledTimes(1)
            })

            const [updatedParams] = mockSetSearchParams.mock.calls[0]
            expect(updatedParams).toBeInstanceOf(URLSearchParams)
            expect(updatedParams.get('session-id')).toBe('test-session-123')
        })

        it('should not populate session-id in search params when use-v3 is disabled', () => {
            mockedUseSearchParams.mockReturnValue([
                new URLSearchParams('use-v3=false'),
                mockSetSearchParams,
            ])

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(mockSetSearchParams).not.toHaveBeenCalled()
        })

        it('should not update search params when external session id already matches', () => {
            mockedUseSearchParams.mockReturnValue([
                new URLSearchParams('session-id=test-session-123'),
                mockSetSearchParams,
            ])

            renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(mockSetSearchParams).not.toHaveBeenCalled()
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
                useV3: false,
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
                useV3: false,
            })
        })
    })

    describe('Actions state management', () => {
        it('should default areActionsEnabled to false when arePlaygroundActionsAllowed is not provided', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(false)
        })

        it('should set areActionsEnabled to true when arePlaygroundActionsAllowed is true', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider arePlaygroundActionsAllowed={true}>
                        {children}
                    </CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(true)
        })

        it('should allow setting areActionsEnabled through setAreActionsEnabled', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(false)

            act(() => {
                result.current.setAreActionsEnabled(true)
            })

            expect(result.current.areActionsEnabled).toBe(true)
        })

        it('should set areActionsEnabled to true when either arePlaygroundActionsAllowed or settings state is true', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider arePlaygroundActionsAllowed={false}>
                        {children}
                    </CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(false)

            act(() => {
                result.current.setAreActionsEnabled(true)
            })

            expect(result.current.areActionsEnabled).toBe(true)
        })

        it('should keep areActionsEnabled true when arePlaygroundActionsAllowed is true even if settings state is false', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider arePlaygroundActionsAllowed={true}>
                        {children}
                    </CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(true)

            act(() => {
                result.current.setAreActionsEnabled(false)
            })

            expect(result.current.areActionsEnabled).toBe(true)
        })

        it('should pass updated areActionsEnabled to useTestSession', () => {
            const useTestSession = require('../../hooks/useTestSession')
                .useTestSession as jest.Mock

            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(useTestSession).toHaveBeenLastCalledWith(
                'https://test-base-url.com',
                expect.objectContaining({
                    areActionsAllowedToExecute: false,
                }),
                false,
                undefined,
            )

            act(() => {
                result.current.setAreActionsEnabled(true)
            })

            expect(useTestSession).toHaveBeenLastCalledWith(
                'https://test-base-url.com',
                expect.objectContaining({
                    areActionsAllowedToExecute: true,
                }),
                false,
                undefined,
            )
        })

        it('should reset actions to default value when resetToDefaultActionsEnabled is called', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            act(() => {
                result.current.setAreActionsEnabled(true)
            })

            expect(result.current.areActionsEnabled).toBe(true)

            act(() => {
                result.current.resetToDefaultActionsEnabled()
            })

            expect(result.current.areActionsEnabled).toBe(false)
        })

        it('should not affect areActionsEnabled when arePlaygroundActionsAllowed is true', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider arePlaygroundActionsAllowed={true}>
                        {children}
                    </CoreProvider>
                ),
            })

            expect(result.current.areActionsEnabled).toBe(true)

            act(() => {
                result.current.resetToDefaultActionsEnabled()
            })

            expect(result.current.areActionsEnabled).toBe(true)
        })
    })

    describe('Channel reset functionality', () => {
        it('should expose resetToDefaultChannel function from usePlaygroundChannel', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            expect(typeof result.current.resetToDefaultChannel).toBe('function')
        })

        it('should call resetToDefaultChannel when invoked', () => {
            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider>{children}</CoreProvider>
                ),
            })

            act(() => {
                result.current.resetToDefaultChannel()
            })

            expect(mockResetToDefaultChannel).toHaveBeenCalledTimes(1)
        })
    })

    it('should include isDraftKnowledgeReady in context value', () => {
        const { result } = renderHook(() => useCoreContext(), {
            wrapper: ({ children }) => <CoreProvider>{children}</CoreProvider>,
        })

        expect(result.current.isDraftKnowledgeReady).toBeDefined()
        expect(typeof result.current.isDraftKnowledgeReady).toBe('boolean')
    })

    it.each([
        {
            mockValue: true,
            expected: true,
            description: 'ready',
        },
        {
            mockValue: false,
            expected: false,
            description: 'not ready',
        },
    ])(
        'should return isDraftKnowledgeReady as $expected when $description',
        ({ mockValue, expected }) => {
            mockIsDraftKnowledgeReady.mockReturnValue(mockValue)

            const { result } = renderHook(() => useCoreContext(), {
                wrapper: ({ children }) => (
                    <CoreProvider
                        draftKnowledge={{
                            sourceId: 123,
                            sourceSetId: 456,
                        }}
                    >
                        {children}
                    </CoreProvider>
                ),
            })

            expect(result.current.isDraftKnowledgeReady).toBe(expected)
        },
    )
})
