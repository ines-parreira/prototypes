import { render, screen } from '@testing-library/react'

import { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import { TicketMessage } from 'models/ticket/types'
import { useTicketMessageTranslations } from 'tickets/core/hooks/useTicketMessageTranslations'

import { useTicketMessageTranslationDisplay } from '../context/useTicketMessageTranslationDisplay'
import { withMessageTranslations } from '../withMessageTranslations'

// Mock the dependencies
jest.mock('tickets/core/hooks/useTicketMessageTranslations')
jest.mock('../context/useTicketMessageTranslationDisplay')

const mockUseTicketMessageTranslations =
    useTicketMessageTranslations as jest.MockedFunction<
        typeof useTicketMessageTranslations
    >
const mockUseTicketMessageTranslationDisplay =
    useTicketMessageTranslationDisplay as jest.MockedFunction<
        typeof useTicketMessageTranslationDisplay
    >

// Test component to be wrapped
function TestComponent({
    message,
    ticketId,
    extraProp,
}: {
    message: TicketMessage
    ticketId: number
    extraProp: string
}) {
    return (
        <div>
            <div data-testid="message-id">{message.id}</div>
            <div data-testid="ticket-id">{ticketId}</div>
            <div data-testid="extra-prop">{extraProp}</div>
            <div data-testid="message-stripped-html">
                {message.stripped_html || 'no-html'}
            </div>
            <div data-testid="message-stripped-text">
                {message.stripped_text || 'no-text'}
            </div>
        </div>
    )
}

// Create the wrapped component
const WrappedTestComponent = withMessageTranslations(TestComponent)

describe('withMessageTranslations', () => {
    const mockMessage: TicketMessage = {
        id: 123,
        stripped_html: '<p>Original HTML</p>',
        stripped_text: 'Original text',
        // Add other required properties as needed
    } as TicketMessage

    const mockTicketId = 456
    const mockExtraProp = 'extra-value'

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('original'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })
    })

    it('should render the wrapped component with original props', () => {
        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-id')).toHaveTextContent('123')
        expect(screen.getByTestId('ticket-id')).toHaveTextContent('456')
        expect(screen.getByTestId('extra-prop')).toHaveTextContent(
            'extra-value',
        )
        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Original HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Original text',
        )
    })

    it('should call useTicketMessageTranslations with correct ticket_id', () => {
        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(mockUseTicketMessageTranslations).toHaveBeenCalledWith({
            ticket_id: mockTicketId,
        })
    })

    it('should call useTicketMessageTranslation to get display preference', () => {
        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(mockUseTicketMessageTranslationDisplay).toHaveBeenCalled()
    })

    it('should return original message when translation display is set to original', () => {
        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('original'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })

        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Original HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Original text',
        )
    })

    it('should return translated message when translation display is set to translated and translation exists', () => {
        const mockTranslation = {
            stripped_html: '<p>Translated HTML</p>',
            stripped_text: 'Translated text',
        } as TicketMessageTranslation

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: mockTranslation,
            },
        })

        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('translated'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })

        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Translated HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Translated text',
        )
    })

    it('should return original message when translation display is translated but no translation exists', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('translated'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })

        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Original HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Original text',
        )
    })

    it('should handle message with null stripped_html and stripped_text', () => {
        const messageWithNulls: TicketMessage = {
            ...mockMessage,
            stripped_html: null,
            stripped_text: null,
        }

        render(
            <WrappedTestComponent
                message={messageWithNulls}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            'no-html',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'no-text',
        )
    })

    it('should handle message with undefined stripped_html and stripped_text', () => {
        const messageWithUndefined: Partial<TicketMessage> = {
            ...mockMessage,
            stripped_html: undefined,
            stripped_text: undefined,
        }

        render(
            <WrappedTestComponent
                message={messageWithUndefined as TicketMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            'no-html',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'no-text',
        )
    })

    it('should handle message without id', () => {
        const messageWithoutId: TicketMessage = {
            ...mockMessage,
            id: undefined,
        } as TicketMessage

        render(
            <WrappedTestComponent
                message={messageWithoutId}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Original HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Original text',
        )
    })

    it('should handle translation with null values gracefully', () => {
        const mockTranslation = {
            stripped_html: null,
            stripped_text: null,
        } as TicketMessageTranslation

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: mockTranslation,
            },
        })

        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('translated'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })

        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            'no-html',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'no-text',
        )
    })

    it('should preserve all original message properties when returning translated message', () => {
        const mockTranslation = {
            stripped_html: '<p>Translated HTML</p>',
            stripped_text: 'Translated text',
        } as TicketMessageTranslation

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: mockTranslation,
            },
        })

        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            getTicketMessageTranslationDisplay: jest
                .fn()
                .mockReturnValue('translated'),
            setTicketMessageTranslationDisplay: jest.fn(),
        })

        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        // Should preserve the original message ID
        expect(screen.getByTestId('message-id')).toHaveTextContent('123')
        // Should use translated content
        expect(screen.getByTestId('message-stripped-html')).toHaveTextContent(
            '<p>Translated HTML</p>',
        )
        expect(screen.getByTestId('message-stripped-text')).toHaveTextContent(
            'Translated text',
        )
    })

    it('should pass through all props to the wrapped component', () => {
        render(
            <WrappedTestComponent
                message={mockMessage}
                ticketId={mockTicketId}
                extraProp={mockExtraProp}
            />,
        )

        // All props should be passed through
        expect(screen.getByTestId('message-id')).toHaveTextContent('123')
        expect(screen.getByTestId('ticket-id')).toHaveTextContent('456')
        expect(screen.getByTestId('extra-prop')).toHaveTextContent(
            'extra-value',
        )
    })
})
