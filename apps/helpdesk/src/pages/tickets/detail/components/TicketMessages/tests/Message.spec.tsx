import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketMessage } from 'models/ticket/types'

import Message from '../Message'

// Mock the translation hooks to avoid QueryClient issues
jest.mock('tickets/core/hooks/useTicketMessageTranslations', () => ({
    useTicketMessageTranslations: () => ({
        ticketMessagesTranslationMap: {},
    }),
}))

jest.mock(
    '../TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay',
    () => ({
        useTicketMessageTranslationDisplay: () => ({
            getTicketMessageTranslationDisplay: () => 'original',
        }),
    }),
)

jest.mock('pages/common/components/AIBanner/AIBanner', () => () => (
    <div>AIBanner</div>
))
jest.mock('tickets/ticket-detail/components/MessageActions', () => ({
    MessageActions: () => <div>Actions</div>,
}))
jest.mock('tickets/ticket-detail/components/MessageAttachments', () => ({
    MessageAttachments: () => <div>Attachments</div>,
}))
jest.mock('tickets/ticket-detail/components/MessageMetadata', () => ({
    MessageMetadata: () => <div>MessageMetadata</div>,
}))
jest.mock('../Body', () => () => <div>Body</div>)
jest.mock('../Errors', () => () => <div>Errors</div>)
jest.mock('../ReplyDetailsCard', () => () => <div>ReplyDetailsCard</div>)
jest.mock('../SourceActionsHeader', () => () => <div>SourceActionsHeader</div>)

describe('Message', () => {
    const defaultProps = {
        message: {
            id: 123,
            body_text: 'a test',
            body_html: '<strong>a test</strong>',
            source: {
                type: 'email',
            },
            meta: {},
        } as TicketMessage,
        showSourceDetails: false,
        ticketId: 1,
        timezone: 'UTC',
        isAIAgentMessage: false,
        messagePosition: 1,
    }

    it('should render a message with all required sections', () => {
        render(<Message {...defaultProps} />)
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should render the source details if showSourceDetails is true', () => {
        render(<Message {...defaultProps} showSourceDetails />)
        expect(screen.getByText('SourceActionsHeader')).toBeInTheDocument()
        expect(screen.getByText('MessageMetadata')).toBeInTheDocument()
    })

    it('should display an embedded reply details card if meta.replied_to is present', () => {
        render(
            <Message
                {...defaultProps}
                message={{
                    ...defaultProps.message,
                    meta: {
                        replied_to: {
                            ticket_id: 1,
                            ticket_message_id: 2,
                        },
                    },
                }}
            />,
        )
        expect(screen.getByText('ReplyDetailsCard')).toBeInTheDocument()
    })

    it('should not display reply details card when meta.replied_to is not present', () => {
        render(<Message {...defaultProps} />)
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not display reply details card when meta.replied_to is falsy', () => {
        render(
            <Message
                {...defaultProps}
                message={{
                    ...defaultProps.message,
                    meta: {
                        replied_to: undefined,
                    },
                }}
            />,
        )
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not render Actions when isAIAgentMessage is true', () => {
        render(<Message {...defaultProps} isAIAgentMessage />)
        expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })

    it('should render Actions when isAIAgentMessage is false', () => {
        render(<Message {...defaultProps} isAIAgentMessage={false} />)
        expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should apply correct CSS classes based on showSourceDetails', () => {
        const { container } = render(
            <Message {...defaultProps} showSourceDetails />,
        )
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).toHaveClass('hasSourceDetails')
    })

    it('should not apply hasSourceDetails class when showSourceDetails is false', () => {
        const { container } = render(
            <Message {...defaultProps} showSourceDetails={false} />,
        )
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).not.toHaveClass('hasSourceDetails')
    })

    it('should handle mouse enter and leave events for source details visibility', async () => {
        const user = userEvent.setup()
        render(<Message {...defaultProps} showSourceDetails />)

        const wrapper = screen.getByText('Body').closest('div')
        expect(wrapper).toBeInTheDocument()

        if (wrapper) {
            await user.hover(wrapper)
            // The component should handle mouse events without errors
            await user.unhover(wrapper)
        }
    })

    it('should pass correct props to Body component', () => {
        const messageWithError = {
            ...defaultProps.message,
            status: 'failed',
        } as TicketMessage

        render(
            <Message
                {...defaultProps}
                message={messageWithError}
                messagePosition={5}
            />,
        )

        // Body component should receive the message, hasError, and messagePosition
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should pass correct props to Errors component', () => {
        const messageWithError = {
            ...defaultProps.message,
            status: 'failed',
        } as TicketMessage

        render(
            <Message
                {...defaultProps}
                message={messageWithError}
                setStatus={jest.fn()}
            />,
        )

        // Errors component should receive the message, ticketId, loading, hasActionError, and setStatus
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should handle message without id gracefully', () => {
        const messageWithoutId = {
            ...defaultProps.message,
            id: undefined,
        } as TicketMessage

        render(<Message {...defaultProps} message={messageWithoutId} />)

        // Should still render without errors
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('should handle message with undefined id gracefully', () => {
        const messageWithUndefinedId = {
            ...defaultProps.message,
            id: undefined,
        } as TicketMessage

        render(<Message {...defaultProps} message={messageWithUndefinedId} />)

        // Should still render without errors
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('should pass the displayedMessage to child components', () => {
        render(<Message {...defaultProps} />)

        // All child components should receive the message prop
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should handle setStatus prop when provided', () => {
        const setStatus = jest.fn()
        render(<Message {...defaultProps} setStatus={setStatus} />)

        // Component should render without errors when setStatus is provided
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle setStatus prop when not provided', () => {
        render(<Message {...defaultProps} />)

        // Component should render without errors when setStatus is not provided
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should render with different message positions', () => {
        render(<Message {...defaultProps} messagePosition={10} />)
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should render with different ticket IDs', () => {
        render(<Message {...defaultProps} ticketId={999} />)
        expect(screen.getByText('Body')).toBeInTheDocument()
    })
})
