import { render, screen } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { isForwardedMessage } from 'tickets/common/utils'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import { MessageHeader } from '../MessageHeader'

jest.mock('core/flags')
jest.mock('timeline/ticket-modal/hooks/useTicketModalContext')
jest.mock('tickets/common/utils')

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: jest.fn(({ name, isAIAgent }) => (
        <span>
            {name} {isAIAgent && '(AI)'}
        </span>
    )),
    CustomerLabel: jest.fn(({ customer }) => (
        <span>{customer.get('name')}</span>
    )),
}))

jest.mock('pages/tickets/detail/components/TicketMessages/Meta', () =>
    jest.fn(() => <span>Meta Component</span>),
)

jest.mock('pages/tickets/detail/components/TicketMessages/Source', () =>
    jest.fn(() => <span>Source Component</span>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceActionsHeader',
    () => jest.fn(() => <span>Actions Header</span>),
)

jest.mock('tickets/ticket-detail/components/MessageMetadata', () => ({
    MessageMetadata: jest.fn(() => <span>Message Metadata</span>),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockUseTicketModalContext = jest.mocked(useTicketModalContext)
const mockIsForwardedMessage = jest.mocked(isForwardedMessage)

describe('MessageHeader', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseTicketModalContext.mockReturnValue({
            containerRef: null,
            isInsideTicketModal: false,
        })
        mockIsForwardedMessage.mockReturnValue(false)
    })

    it('renders agent message correctly', () => {
        const message = {
            from_agent: true,
            sender: { name: 'Agent Smith' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} />)

        expect(screen.getByText('Agent Smith')).toBeInTheDocument()
        expect(screen.getByText('Meta Component')).toBeInTheDocument()
        expect(screen.getByText('Source Component')).toBeInTheDocument()
    })

    it('renders customer message correctly', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} />)

        expect(screen.getByText('Customer')).toBeInTheDocument()
        expect(screen.getByText('Meta Component')).toBeInTheDocument()
        expect(screen.getByText('Source Component')).toBeInTheDocument()
    })

    it('renders AI agent correctly', () => {
        const message = {
            from_agent: true,
            sender: { name: 'AI Agent' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} isAI={true} />)

        expect(screen.getByText('AI Agent (AI)')).toBeInTheDocument()
    })

    it('handles deleted message state', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} isMessageDeleted={true} />)

        expect(
            screen.getByText('Comment deleted on Facebook'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Meta Component')).not.toBeInTheDocument()
    })

    it('handles hidden message state', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} isMessageHidden={true} />)

        expect(screen.getByText('Message hidden')).toBeInTheDocument()
        expect(screen.queryByText('Meta Component')).not.toBeInTheDocument()
    })

    it('handles duplicated hidden message', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            meta: { is_duplicated: true },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} isMessageHidden={true} />)

        expect(screen.getByText('Meta Component')).toBeInTheDocument()
        expect(screen.queryByText('Message hidden')).not.toBeInTheDocument()
    })

    it('applies error styling when isFailed is true', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        const { container } = render(
            <MessageHeader message={message} isFailed={true} />,
        )

        expect(container.querySelector('.failed')).toBeInTheDocument()
    })

    it('hides SourceActionsHeader in readonly mode', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} readonly={true} />)

        expect(screen.queryByText('Actions Header')).not.toBeInTheDocument()
    })

    it('shows SourceActionsHeader when not readonly', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} readonly={false} />)

        expect(screen.getByText('Actions Header')).toBeInTheDocument()
    })

    it('renders MessageMetadata in correct position with feature flag enabled', () => {
        mockUseFlag.mockImplementation(
            (flag: string) => flag === FeatureFlagKey.TicketThreadRevamp,
        )

        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        const { container } = render(<MessageHeader message={message} />)

        const headerDetails = container.querySelector('.headerDetails')
        const metadataText = screen.getByText('Message Metadata')
        expect(headerDetails).toContainElement(metadataText)
    })

    it('renders MessageMetadata in correct position with feature flag disabled', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        const { container } = render(<MessageHeader message={message} />)

        const rightWrapper = container.querySelector('.rightWrapper')
        const metadataText = screen.getByText('Message Metadata')
        expect(rightWrapper).toContainElement(metadataText)
    })

    it('does not render Source when message.source is missing', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        render(<MessageHeader message={message} />)

        expect(screen.queryByText('Source Component')).not.toBeInTheDocument()
    })

    it('applies correct CSS classes for different message states', () => {
        const message = {
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as TicketMessage

        const { container, rerender } = render(
            <MessageHeader message={message} />,
        )

        let authorElement = container.querySelector('.author')
        expect(authorElement).not.toHaveClass('isAgent')
        expect(authorElement).not.toHaveClass('hiddenMessage')
        expect(authorElement).not.toHaveClass('deletedMessage')

        const agentMessage = { ...message, from_agent: true }
        rerender(<MessageHeader message={agentMessage} />)
        authorElement = container.querySelector('.author')
        expect(authorElement).toHaveClass('isAgent')

        rerender(<MessageHeader message={message} isMessageHidden={true} />)
        authorElement = container.querySelector('.author')
        expect(authorElement).toHaveClass('hiddenMessage')

        rerender(<MessageHeader message={message} isMessageDeleted={true} />)
        authorElement = container.querySelector('.author')
        expect(authorElement).toHaveClass('deletedMessage')
    })
})
