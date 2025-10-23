import { renderHook } from '@testing-library/react'

import {
    InnerPlaygroundProvider,
    usePlaygroundContext,
} from '../PlaygroundContext'

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(() => ({
        messages: [],
        onMessageSend: jest.fn(),
        isMessageSending: false,
        onNewConversation: jest.fn(),
        isWaitingResponse: false,
    })),
}))

describe('PlaygroundContext', () => {
    describe('usePlaygroundContext', () => {
        it('should throw error when used outside provider', () => {
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
                    <InnerPlaygroundProvider>
                        {children}
                    </InnerPlaygroundProvider>
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
