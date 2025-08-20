import { useContext } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from '../context/ticketMessageTranslationDisplayContext'
import { TicketMessageTranslationDisplayProvider } from '../TicketMessageTranslationDisplayProvider'

// Test component to access context values
function TestConsumer() {
    const context = useContext(TicketMessagesTranslationDisplayContext)

    return (
        <div>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 1,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                        },
                    ])
                }
                aria-label="Set message 1 to original"
            >
                Set Original
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 2,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                        },
                    ])
                }
                aria-label="Set message 2 to translated"
            >
                Set Translated
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 3,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                        },
                    ])
                }
                aria-label="Set message 3 to original"
            >
                Set Original 3
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 1,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                        },
                        {
                            messageId: 2,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                        },
                    ])
                }
                aria-label="Set multiple messages"
            >
                Set Multiple
            </button>
            <div data-testid="message-1-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(1))}
            </div>
            <div data-testid="message-2-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(2))}
            </div>
            <div data-testid="message-3-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(3))}
            </div>
            <div data-testid="message-999-display">
                {JSON.stringify(
                    context.getTicketMessageTranslationDisplay(999),
                )}
            </div>
        </div>
    )
}

describe('TicketMessageTranslationProvider', () => {
    it('should render children without crashing', () => {
        render(
            <TicketMessageTranslationDisplayProvider>
                <div>Test Content</div>
            </TicketMessageTranslationDisplayProvider>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should provide context with default values', () => {
        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Default value for non-existent message should be Original with Idle state
        const defaultDisplay = JSON.parse(
            screen.getByTestId('message-999-display').textContent || '{}',
        )
        expect(defaultDisplay.display).toBe(DisplayedContent.Original)
        expect(defaultDisplay.fetchingState).toBe(FetchingState.Idle)
    })

    it('should allow setting and getting translation display for specific message IDs', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Initially, message 1 should have default value
        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        // Set message 1 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        // Set message 2 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)

        // Set message 3 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 3 to original'))
        })
        const display3 = JSON.parse(
            screen.getByTestId('message-3-display').textContent || '{}',
        )
        expect(display3.display).toBe(DisplayedContent.Original)
        expect(display3.fetchingState).toBe(FetchingState.Idle)
    })

    it('should maintain separate state for different message IDs', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Set different values for different messages
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 3 to original'))
        })

        // Verify each message maintains its own state
        const display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)

        const display3 = JSON.parse(
            screen.getByTestId('message-3-display').textContent || '{}',
        )
        expect(display3.display).toBe(DisplayedContent.Original)
        expect(display3.fetchingState).toBe(FetchingState.Idle)
    })

    it('should update state when setTicketMessageTranslationDisplay is called multiple times', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Set message 1 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        // Set message 2 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
    })

    it('should provide stable callback references', () => {
        const { rerender } = render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        const firstRender = screen.getByTestId('message-1-display')
        const initialValue = firstRender.textContent || ''

        // Re-render the component
        rerender(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // The value should remain the same after re-render
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            initialValue,
        )
    })

    it('should handle multiple children correctly', () => {
        render(
            <TicketMessageTranslationDisplayProvider>
                <div>Child 1</div>
                <div>Child 2</div>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        expect(screen.getByText('Child 1')).toBeInTheDocument()
        expect(screen.getByText('Child 2')).toBeInTheDocument()
        expect(screen.getByTestId('message-1-display')).toBeInTheDocument()
    })

    it('should override existing message display when setTicketMessageTranslationDisplay is called again', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Set message 1 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        // Set message 2 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)

        // Override message 1 again
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
    })

    it('should handle batch updates for multiple messages', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Set multiple messages at once
        await act(async () => {
            await user.click(screen.getByLabelText('Set multiple messages'))
        })

        // Verify both messages were updated
        const display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
    })
})
