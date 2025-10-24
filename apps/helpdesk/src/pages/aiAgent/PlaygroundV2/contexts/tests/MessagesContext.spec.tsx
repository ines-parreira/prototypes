import { renderHook } from '@testing-library/react'

import { MessageType } from 'models/aiAgentPlayground/types'

import { MessagesProvider, useMessagesContext } from '../MessagesContext'

const mockOnMessageSend = jest.fn()
const mockOnNewConversation = jest.fn()

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(() => ({
        messages: [
            {
                sender: 'user',
                type: MessageType.MESSAGE,
                content: 'Test message',
                createdDatetime: '2024-01-01T00:00:00Z',
            },
        ],
        onMessageSend: mockOnMessageSend,
        isMessageSending: false,
        onNewConversation: mockOnNewConversation,
        isWaitingResponse: false,
    })),
}))

describe('MessagesContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useMessagesContext', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useMessagesContext())
            }).toThrow(
                'useMessagesContext must be used within a MessagesProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value when used inside provider', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current).toBeDefined()
            expect(result.current.messages).toHaveLength(1)
            expect(result.current.messages[0]).toEqual({
                sender: 'user',
                type: MessageType.MESSAGE,
                content: 'Test message',
                createdDatetime: '2024-01-01T00:00:00Z',
            })
        })

        it('should provide messages array', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(Array.isArray(result.current.messages)).toBe(true)
            expect(result.current.messages).toHaveLength(1)
        })

        it('should provide onMessageSend function', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(typeof result.current.onMessageSend).toBe('function')
            expect(result.current.onMessageSend).toBe(mockOnMessageSend)
        })

        it('should provide isMessageSending boolean', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(typeof result.current.isMessageSending).toBe('boolean')
            expect(result.current.isMessageSending).toBe(false)
        })

        it('should provide onNewConversation function', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(typeof result.current.onNewConversation).toBe('function')
            expect(result.current.onNewConversation).toBe(mockOnNewConversation)
        })

        it('should provide isWaitingResponse boolean', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(typeof result.current.isWaitingResponse).toBe('boolean')
            expect(result.current.isWaitingResponse).toBe(false)
        })
    })

    describe('MessagesProvider', () => {
        it('should pass all hook values to context', () => {
            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current).toEqual({
                messages: [
                    {
                        sender: 'user',
                        type: MessageType.MESSAGE,
                        content: 'Test message',
                        createdDatetime: '2024-01-01T00:00:00Z',
                    },
                ],
                onMessageSend: mockOnMessageSend,
                isMessageSending: false,
                onNewConversation: mockOnNewConversation,
                isWaitingResponse: false,
            })
        })

        it('should handle empty messages array', () => {
            const usePlaygroundMessages =
                require('../../hooks/usePlaygroundMessages')
                    .usePlaygroundMessages as jest.Mock

            usePlaygroundMessages.mockReturnValueOnce({
                messages: [],
                onMessageSend: mockOnMessageSend,
                isMessageSending: false,
                onNewConversation: mockOnNewConversation,
                isWaitingResponse: false,
            })

            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current.messages).toEqual([])
        })

        it('should handle isMessageSending being true', () => {
            const usePlaygroundMessages =
                require('../../hooks/usePlaygroundMessages')
                    .usePlaygroundMessages as jest.Mock

            usePlaygroundMessages.mockReturnValueOnce({
                messages: [],
                onMessageSend: mockOnMessageSend,
                isMessageSending: true,
                onNewConversation: mockOnNewConversation,
                isWaitingResponse: false,
            })

            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current.isMessageSending).toBe(true)
        })

        it('should handle isWaitingResponse being true', () => {
            const usePlaygroundMessages =
                require('../../hooks/usePlaygroundMessages')
                    .usePlaygroundMessages as jest.Mock

            usePlaygroundMessages.mockReturnValueOnce({
                messages: [],
                onMessageSend: mockOnMessageSend,
                isMessageSending: false,
                onNewConversation: mockOnNewConversation,
                isWaitingResponse: true,
            })

            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current.isWaitingResponse).toBe(true)
        })

        it('should handle multiple message types', () => {
            const usePlaygroundMessages =
                require('../../hooks/usePlaygroundMessages')
                    .usePlaygroundMessages as jest.Mock

            usePlaygroundMessages.mockReturnValueOnce({
                messages: [
                    {
                        sender: 'user',
                        type: MessageType.MESSAGE,
                        content: 'User message',
                        createdDatetime: '2024-01-01T00:00:00Z',
                    },
                    {
                        sender: 'ai-agent',
                        type: MessageType.PLACEHOLDER,
                        createdDatetime: '2024-01-01T00:00:01Z',
                    },
                    {
                        sender: 'ai-agent',
                        type: MessageType.ERROR,
                        content: 'Error message',
                        createdDatetime: '2024-01-01T00:00:02Z',
                    },
                ],
                onMessageSend: mockOnMessageSend,
                isMessageSending: false,
                onNewConversation: mockOnNewConversation,
                isWaitingResponse: false,
            })

            const { result } = renderHook(() => useMessagesContext(), {
                wrapper: ({ children }) => (
                    <MessagesProvider>{children}</MessagesProvider>
                ),
            })

            expect(result.current.messages).toHaveLength(3)
            expect(result.current.messages[0].type).toBe(MessageType.MESSAGE)
            expect(result.current.messages[1].type).toBe(
                MessageType.PLACEHOLDER,
            )
            expect(result.current.messages[2].type).toBe(MessageType.ERROR)
        })
    })
})
