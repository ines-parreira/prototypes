import { render } from '@testing-library/react'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketMessageSourceType } from 'business/types/ticket'
import { message } from 'models/ticket/tests/mocks'

import MessageStatusIndicator, {
    getMessageStatus,
    MessageStatus,
} from '../MessageStatusIndicator'

describe('getMessageStatus', () => {
    const castMessage = message as TicketMessage
    it.each([
        {
            description: 'with sent_datetime',
            opened: false,
            sent: true,
            failed: false,
        },
        {
            description: 'with failed_datetime and sent_datetime',
            opened: false,
            sent: true,
            failed: true,
        },
        {
            description: 'with opened_datetime and sent_datetime',
            opened: true,
            sent: true,
            failed: false,
        },
        {
            description: 'with no datetime fields',
            opened: false,
            sent: false,
            failed: false,
        },
    ])(
        'should return Transient if the message has no ID, regardless of the datetime fields ($description)',
        ({ opened, sent, failed }) => {
            const messageWithoutId = {
                ...message,
                id: undefined,
                sent_datetime: sent ? new Date().toISOString() : undefined,
                opened_datetime: opened ? new Date().toISOString() : null,
                failed_datetime: failed ? new Date().toISOString() : null,
            }

            expect(getMessageStatus(messageWithoutId)).toBe(
                MessageStatus.Transient,
            )
        },
    )

    it.each([
        { description: 'with sent_datetime', sent: true }, // this is the case for email late failures
        { description: 'without sent_datetime', sent: false },
    ])(
        'should return Failed if the message has a failed_datetime ($description)',
        ({ sent }) => {
            const failedMessage = {
                ...castMessage,
                sent_datetime: sent ? new Date().toISOString() : undefined,
                opened_datetime: null,
                failed_datetime: new Date().toISOString(),
            } as TicketMessage

            expect(getMessageStatus(failedMessage)).toBe(MessageStatus.Failed)
        },
    )

    it('should return Opened if the message has an opened_datetime', () => {
        const openedMessage = {
            ...message,
            sent_datetime: new Date().toISOString(),
            opened_datetime: new Date().toISOString(),
            failed_datetime: null,
        }

        expect(getMessageStatus(openedMessage)).toBe(MessageStatus.Opened)
    })

    it('should return Sent if the message has a sent_datetime', () => {
        const sentMessage = {
            ...message,
            sent_datetime: new Date().toISOString(),
            opened_datetime: null,
            failed_datetime: null,
        }

        expect(getMessageStatus(sentMessage)).toBe(MessageStatus.Sent)
    })

    it('should return Pending if the message has no datetime fields', () => {
        const pendingMessage = {
            ...message,
            sent_datetime: undefined,
            opened_datetime: null,
            failed_datetime: null,
        }

        expect(getMessageStatus(pendingMessage)).toBe(MessageStatus.Pending)
    })
})

describe('MessageStatusIndicator', () => {
    it('should render the correct status indicator', () => {
        const sentMessage = {
            ...message,
            from_agent: true,
            sent_datetime: new Date().toISOString(),
            opened_datetime: null,
            failed_datetime: null,
        } as TicketMessage

        const { container } = render(
            <MessageStatusIndicator message={sentMessage} />,
        )

        const iconElement = container.querySelector('.material-icons-outlined')
        expect(iconElement).toBeInTheDocument()
        expect(iconElement?.textContent).toBe('done')
    })

    it('should generate a random ID for transient messages', () => {
        const transientMessage = {
            ...message,
            from_agent: true,
            id: undefined,
        } as unknown as TicketMessage

        const { container } = render(
            <MessageStatusIndicator message={transientMessage} />,
        )

        const iconElement = container.querySelector('.material-icons-outlined')
        expect(iconElement).toBeInTheDocument()
        expect(iconElement?.id).toContain(`message-status-indicator-id-`)
        expect(iconElement?.id).not.toContain('undefined')
    })

    it('should not generate a new ID on re-render for transient messages', () => {
        // this could cause an unhandled error that breaks the app if the user hovers
        // over the message status indicator while it goes from transient to pending
        const transientMessage = {
            ...message,
            from_agent: true,
            id: undefined,
        } as unknown as TicketMessage
        const { container, rerender } = render(
            <MessageStatusIndicator message={transientMessage} />,
        )
        const iconElementId = container.querySelector(
            '.material-icons-outlined',
        )?.id
        const pendingMessage = {
            ...transientMessage,
            id: 42,
            sent_datetime: new Date().toISOString(),
            opened_datetime: null,
            failed_datetime: null,
        }

        rerender(<MessageStatusIndicator message={pendingMessage} />)

        const iconElementId2 = container.querySelector(
            '.material-icons-outlined',
        )?.id
        expect(iconElementId).toEqual(iconElementId2)
    })

    it('should not render the status indicator if the message is not from an agent', () => {
        const messageFromCustomer = {
            ...message,
            from_agent: false,
            sent_datetime: new Date().toISOString(),
            opened_datetime: null,
            failed_datetime: null,
        } as TicketMessage

        const { container } = render(
            <MessageStatusIndicator message={messageFromCustomer} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should not render the status indicator if the message is pending', () => {
        const pendingMessage = {
            ...message,
            from_agent: true,
            sent_datetime: null,
            opened_datetime: null,
            failed_datetime: null,
        } as TicketMessage

        const { container } = render(
            <MessageStatusIndicator message={pendingMessage} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should not render the status indicator if the message is an internal note', () => {
        const internalNoteMessage = {
            ...message,
            from_agent: true,
            sent_datetime: new Date().toISOString(),
            opened_datetime: null,
            failed_datetime: null,
            source: {
                type: TicketMessageSourceType.InternalNote,
            },
        } as TicketMessage

        const { container } = render(
            <MessageStatusIndicator message={internalNoteMessage} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
