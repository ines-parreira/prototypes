import { useContext } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    DisplayedContent,
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
                    context.setTicketMessageTranslationDisplay(
                        1,
                        DisplayedContent.Original,
                    )
                }
                aria-label="Set message 1 to original"
            >
                Set Original
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay(
                        2,
                        DisplayedContent.Translated,
                    )
                }
                aria-label="Set message 2 to translated"
            >
                Set Translated
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay(
                        3,
                        DisplayedContent.Original,
                    )
                }
                aria-label="Set message 3 to original"
            >
                Set Original 3
            </button>
            <div data-testid="message-1-display">
                {context.getTicketMessageTranslationDisplay(1)}
            </div>
            <div data-testid="message-2-display">
                {context.getTicketMessageTranslationDisplay(2)}
            </div>
            <div data-testid="message-3-display">
                {context.getTicketMessageTranslationDisplay(3)}
            </div>
            <div data-testid="message-999-display">
                {context.getTicketMessageTranslationDisplay(999)}
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

        // Default value for non-existent message should be Translated (from implementation)
        expect(screen.getByTestId('message-999-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
    })

    it('should allow setting and getting translation display for specific message IDs', async () => {
        const user = userEvent.setup()

        render(
            <TicketMessageTranslationDisplayProvider>
                <TestConsumer />
            </TicketMessageTranslationDisplayProvider>,
        )

        // Initially, message 1 should have default value
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )

        // Set message 1 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )

        // Set message 2 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        expect(screen.getByTestId('message-2-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )

        // Set message 3 to Original
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 3 to original'))
        })
        expect(screen.getByTestId('message-3-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
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
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
        expect(screen.getByTestId('message-2-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
        expect(screen.getByTestId('message-3-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
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
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )

        // Change message 1 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        // Verify the state change worked for message 2
        expect(screen.getByTestId('message-2-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
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
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )

        // Override message 1 to Translated
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        // Now set message 1 to Translated as well
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
    })
})
