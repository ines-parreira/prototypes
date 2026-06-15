import { render } from '@testing-library/react'

import { useExpandedMessages } from '../useExpandedMessages'

describe('useExpandedMessages', () => {
    it('throws when used outside ExpandedMessagesProvider', () => {
        const TestComponent = () => {
            useExpandedMessages()
            return null
        }
        const preventExpectedWindowError = (event: ErrorEvent) => {
            if (
                event.error instanceof Error &&
                event.error.message ===
                    'useExpandedMessages must be used within ExpandedMessagesProvider'
            ) {
                event.preventDefault()
            }
        }
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        window.addEventListener('error', preventExpectedWindowError)

        try {
            expect(() => render(<TestComponent />)).toThrow(
                'useExpandedMessages must be used within ExpandedMessagesProvider',
            )
        } finally {
            window.removeEventListener('error', preventExpectedWindowError)
            consoleErrorSpy.mockRestore()
        }
    })
})
