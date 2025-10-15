import { act, renderHook } from '@testing-library/react'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { PlaygroundEvent } from '../../types'
import {
    PlaygroundProvider,
    usePlaygroundContext,
    usePlaygroundEvent,
} from '../PlaygroundContext'

jest.mock('../../hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: jest.fn(() => ({
        channel: 'email',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
    })),
}))

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(() => ({
        messages: [],
        onMessageSend: jest.fn(),
        isMessageSending: false,
        onNewConversation: jest.fn(),
        isWaitingResponse: false,
    })),
}))

const defaultProviderValue = {
    storeConfiguration: getStoreConfigurationFixture({
        storeName: 'test-store',
        guidanceHelpCenterId: 123,
    }),
    snippetHelpCenterId: 456,
    httpIntegrationId: 789,
    baseUrl: 'https://test-base-url.com',
    gorgiasDomain: 'test-domain',
    accountId: 123,
    chatIntegrationId: 456,
}

describe('PlaygroundContext', () => {
    describe('usePlaygroundContext', () => {
        it('should throw error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => usePlaygroundContext())
            }).toThrow(
                'usePlaygroundContext must be used within PlaygroundProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value when used inside provider', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current).toBeDefined()
            expect(result.current.storeConfiguration).toEqual(
                defaultProviderValue.storeConfiguration,
            )
            expect(result.current.snippetHelpCenterId).toBe(
                defaultProviderValue.snippetHelpCenterId,
            )
            expect(result.current.httpIntegrationId).toBe(
                defaultProviderValue.httpIntegrationId,
            )
            expect(result.current.baseUrl).toBe(defaultProviderValue.baseUrl)
            expect(result.current.gorgiasDomain).toBe(
                defaultProviderValue.gorgiasDomain,
            )
            expect(result.current.accountId).toBe(
                defaultProviderValue.accountId,
            )
            expect(result.current.chatIntegrationId).toBe(
                defaultProviderValue.chatIntegrationId,
            )
        })

        it('should provide events object', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current.events).toBeDefined()
            expect(result.current.events.on).toBeInstanceOf(Function)
            expect(result.current.events.emit).toBeInstanceOf(Function)
        })

        it('should provide UI state', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current.uiState).toBeDefined()
            expect(result.current.uiState.isInitialMessage).toBe(true)
            expect(result.current.uiState.setIsInitialMessage).toBeInstanceOf(
                Function,
            )
        })

        it('should provide channel state', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current.channelState).toBeDefined()
            expect(result.current.channelState.channel).toBe('email')
            expect(result.current.channelState.channelAvailability).toBe(
                'online',
            )
        })

        it('should provide messages state', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current.messagesState).toBeDefined()
            expect(result.current.messagesState.messages).toEqual([])
            expect(result.current.messagesState.isMessageSending).toBe(false)
            expect(result.current.messagesState.isWaitingResponse).toBe(false)
        })
    })

    describe('PlaygroundProvider', () => {
        it('should pass arePlaygroundActionsAllowed to usePlaygroundMessages', () => {
            const usePlaygroundMessages =
                require('../../hooks/usePlaygroundMessages')
                    .usePlaygroundMessages as jest.Mock

            renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider
                        value={defaultProviderValue}
                        arePlaygroundActionsAllowed={true}
                    >
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(usePlaygroundMessages).toHaveBeenCalledWith(
                expect.objectContaining({
                    arePlaygroundActionsAllowed: true,
                }),
            )
        })

        it('should update isInitialMessage state', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            expect(result.current.uiState.isInitialMessage).toBe(true)

            act(() => {
                result.current.uiState.setIsInitialMessage(false)
            })

            expect(result.current.uiState.isInitialMessage).toBe(false)
        })
    })

    describe('Event system', () => {
        it('should register event listener', () => {
            const callback = jest.fn()

            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            act(() => {
                result.current.events.on(
                    PlaygroundEvent.RESET_CONVERSATION,
                    callback,
                )
            })

            act(() => {
                result.current.events.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).toHaveBeenCalledTimes(1)
        })

        it('should unregister event listener', () => {
            const callback = jest.fn()

            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            let unsubscribe: () => void = () => {}

            act(() => {
                unsubscribe = result.current.events.on(
                    PlaygroundEvent.RESET_CONVERSATION,
                    callback,
                )
            })

            act(() => {
                unsubscribe()
            })

            act(() => {
                result.current.events.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).not.toHaveBeenCalled()
        })

        it('should handle multiple event listeners', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            act(() => {
                result.current.events.on(
                    PlaygroundEvent.RESET_CONVERSATION,
                    callback1,
                )
                result.current.events.on(
                    PlaygroundEvent.RESET_CONVERSATION,
                    callback2,
                )
            })

            act(() => {
                result.current.events.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).toHaveBeenCalledTimes(1)
        })

        it('should reset isInitialMessage when reset event is emitted', () => {
            const { result } = renderHook(() => usePlaygroundContext(), {
                wrapper: ({ children }) => (
                    <PlaygroundProvider value={defaultProviderValue}>
                        {children}
                    </PlaygroundProvider>
                ),
            })

            act(() => {
                result.current.uiState.setIsInitialMessage(false)
            })

            expect(result.current.uiState.isInitialMessage).toBe(false)

            act(() => {
                result.current.events.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(result.current.uiState.isInitialMessage).toBe(true)
        })
    })

    describe('usePlaygroundEvent', () => {
        it('should register event listener on mount', () => {
            const callback = jest.fn()

            const { result } = renderHook(
                () => {
                    const context = usePlaygroundContext()
                    usePlaygroundEvent(
                        PlaygroundEvent.RESET_CONVERSATION,
                        callback,
                    )
                    return context
                },
                {
                    wrapper: ({ children }) => (
                        <PlaygroundProvider value={defaultProviderValue}>
                            {children}
                        </PlaygroundProvider>
                    ),
                },
            )

            act(() => {
                result.current.events.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).toHaveBeenCalledTimes(1)
        })

        it('should unregister event listener on unmount', () => {
            const callback = jest.fn()

            const { result, unmount } = renderHook(
                () => {
                    const context = usePlaygroundContext()
                    usePlaygroundEvent(
                        PlaygroundEvent.RESET_CONVERSATION,
                        callback,
                    )
                    return context
                },
                {
                    wrapper: ({ children }) => (
                        <PlaygroundProvider value={defaultProviderValue}>
                            {children}
                        </PlaygroundProvider>
                    ),
                },
            )

            const emitFn = result.current.events.emit

            unmount()

            act(() => {
                emitFn(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).not.toHaveBeenCalled()
        })
    })
})
