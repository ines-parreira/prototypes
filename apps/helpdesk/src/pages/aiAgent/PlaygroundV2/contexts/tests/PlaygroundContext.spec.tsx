import { renderHook } from '@testing-library/react'

import { MessagesProvider, useMessagesContext } from '../MessagesContext'

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(() => ({
        messages: [],
        onMessageSend: jest.fn(),
        isMessageSending: false,
        onNewConversation: jest.fn(),
        isWaitingResponse: false,
    })),
}))

describe('MessagesContext', () => {
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
            expect(result.current.messages).toEqual([])
            expect(result.current.isMessageSending).toBe(false)
            expect(result.current.isWaitingResponse).toBe(false)
            expect(typeof result.current.onMessageSend).toBe('function')
            expect(typeof result.current.onNewConversation).toBe('function')
        })
    })
})
