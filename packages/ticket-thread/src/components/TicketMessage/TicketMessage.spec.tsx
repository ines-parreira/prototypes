import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import {
    mockTicketMessage,
    mockTicketMessageSource,
    mockTicketMessageSourceAddress,
} from '@gorgias/helpdesk-mocks'

import { TicketThreadPendingState } from '../../hooks/messages/types'
import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import type { MessageChannelProps } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { TicketMessage } from './TicketMessage'

const messageChannelSpy = vi.fn()
const messageBubbleSpy = vi.fn()

vi.mock('../MessageBubble/MessageBubble', () => ({
    MessageBubble: ({
        children,
        pendingState,
    }: {
        children: ReactNode
        pendingState?: string
    }) => {
        messageBubbleSpy({ pendingState })
        return <div>{children}</div>
    },
}))

vi.mock('../MessageBubble/components/MessageHeader/Layout', () => ({
    MessageHeaderContainer: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('../MessageBubble/components/MessageHeader/MessageAvatar', () => ({
    MessageAvatar: () => <div>MessageAvatar</div>,
}))

vi.mock('../MessageBubble/components/MessageHeader/MessageSender', () => ({
    MessageSender: () => <div>MessageSender</div>,
}))

vi.mock('../MessageBubble/components/MessageHeader/MessageChannel', () => ({
    MessageChannel: (props: MessageChannelProps) => {
        messageChannelSpy(props)
        return <div>MessageChannel</div>
    },
}))

vi.mock(
    '../MessageBubble/components/MessageHeader/MessageDeliveryIcon',
    () => ({
        MessageDeliveryIcon: () => <div>MessageDeliveryIcon</div>,
    }),
)

vi.mock('../MessageBubble/components/MessageHeader/MessageTimestamp', () => ({
    MessageTimestamp: () => <div>MessageTimestamp</div>,
}))

vi.mock('../MessageBubble/components/MessageBody', () => ({
    MessageBody: () => <div>MessageBody</div>,
}))

vi.mock('../MessageBubble/components/MessageFooter', () => ({
    MessageFooter: () => <div>MessageFooter</div>,
}))

vi.mock('../MessageBubble/components/MessageErrors', () => ({
    MessageErrors: () => <div>MessageErrors</div>,
}))

vi.mock('../MessageBubble/components/PendingMessageBanner', () => ({
    PendingMessageBanner: () => <div>PendingMessageBanner</div>,
}))

vi.mock('../TicketMessageActions/TicketMessageActions', () => ({
    TicketMessageActions: () => <div>TicketMessageActions</div>,
}))

vi.mock('./hooks/useDisplayedTicketMessage', () => ({
    useDisplayedTicketMessage: ({
        item,
    }: {
        item: TicketThreadRegularMessageItem
    }) => item,
}))

function createItem(): TicketThreadRegularMessageItem {
    return {
        _tag: 'message',
        datetime: '2024-03-21T11:00:00Z',
        data: mockTicketMessage({
            id: 1,
            ticket_id: 123,
            channel: 'email',
            via: 'email',
            body_html: null,
            stripped_html: null,
            body_text: 'hello',
            stripped_text: 'hello',
            attachments: [],
            source: {
                ...mockTicketMessageSource({ type: 'email' }),
                type: 'email',
                from: {
                    ...mockTicketMessageSourceAddress({
                        name: 'Support Team',
                        address: 'support@example.com',
                    }),
                    name: 'Support Team',
                    address: 'support@example.com',
                },
                to: [
                    {
                        ...mockTicketMessageSourceAddress({
                            name: 'Alice',
                            address: 'alice@example.com',
                        }),
                        name: 'Alice',
                        address: 'alice@example.com',
                    },
                    {
                        ...mockTicketMessageSourceAddress({
                            name: 'Billing',
                            address: 'billing@example.com',
                        }),
                        name: 'Billing',
                        address: 'billing@example.com',
                    },
                ],
                cc: [
                    {
                        ...mockTicketMessageSourceAddress({
                            name: 'Manager',
                            address: 'manager@example.com',
                        }),
                        name: 'Manager',
                        address: 'manager@example.com',
                    },
                ],
                bcc: [
                    {
                        ...mockTicketMessageSourceAddress({
                            name: 'Audit',
                            address: 'audit@example.com',
                        }),
                        name: 'Audit',
                        address: 'audit@example.com',
                    },
                ],
            },
            sender: {
                id: 1,
                name: 'Agent Smith',
                firstname: 'Agent',
                lastname: 'Smith',
                email: 'agent@example.com',
                meta: null,
            },
        }) as TicketThreadRegularMessageItem['data'],
    }
}

describe('TicketMessage', () => {
    beforeEach(() => {
        messageChannelSpy.mockClear()
        messageBubbleSpy.mockClear()
    })

    it('passes formatted from, to, cc, and bcc labels to the channel tooltip', () => {
        render(<TicketMessage item={createItem()} />)

        expect(messageChannelSpy.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                from: 'Support Team (support@example.com)',
                to: 'Alice (alice@example.com), Billing (billing@example.com)',
                cc: 'Manager (manager@example.com)',
                bcc: 'Audit (audit@example.com)',
            }),
        )
    })

    it('renders the pending banner above message errors for pending sent messages', () => {
        const item = {
            ...createItem(),
            pendingState: TicketThreadPendingState.Active,
        }

        render(<TicketMessage item={item} />)

        const pendingMessageBanner = screen.getByText('PendingMessageBanner')
        const messageErrors = screen.getByText('MessageErrors')

        expect(
            pendingMessageBanner.compareDocumentPosition(messageErrors),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('passes the active pending state to the message bubble', () => {
        render(
            <TicketMessage
                item={{
                    ...createItem(),
                    pendingState: TicketThreadPendingState.Active,
                }}
            />,
        )

        expect(messageBubbleSpy).toHaveBeenCalledWith({
            pendingState: TicketThreadPendingState.Active,
        })
    })

    it('passes the failed pending state to the message bubble', () => {
        render(
            <TicketMessage
                item={{
                    ...createItem(),
                    pendingState: TicketThreadPendingState.Failed,
                }}
            />,
        )

        expect(messageBubbleSpy).toHaveBeenCalledWith({
            pendingState: TicketThreadPendingState.Failed,
        })
    })
})
