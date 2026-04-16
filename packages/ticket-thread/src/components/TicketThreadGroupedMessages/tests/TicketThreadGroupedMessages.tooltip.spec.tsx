import type { ReactNode } from 'react'

import { render } from '@testing-library/react'

import {
    mockTicketMessage,
    mockTicketMessageSource,
    mockTicketMessageSourceAddress,
} from '@gorgias/helpdesk-mocks'

import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import type { MessageChannelProps } from '../../MessageBubble/components/MessageHeader/MessageChannel'
import { TicketThreadGroupedMessages } from '../TicketThreadGroupedMessages'

const messageChannelSpy = vi.fn()

vi.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../MessageBubble/MessageBubble', () => ({
    MessageBubble: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('../../MessageBubble/components/MessageHeader/Layout', () => ({
    MessageHeaderContainer: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('../../MessageBubble/components/MessageHeader/MessageAvatar', () => ({
    MessageAvatar: () => <div>MessageAvatar</div>,
}))

vi.mock('../../MessageBubble/components/MessageHeader/MessageSender', () => ({
    MessageSender: () => <div>MessageSender</div>,
}))

vi.mock('../../MessageBubble/components/MessageHeader/MessageChannel', () => ({
    MessageChannel: (props: MessageChannelProps) => {
        messageChannelSpy(props)
        return <div>MessageChannel</div>
    },
}))

vi.mock(
    '../../MessageBubble/components/MessageHeader/MessageDeliveryIcon',
    () => ({
        MessageDeliveryIcon: () => <div>MessageDeliveryIcon</div>,
    }),
)

vi.mock(
    '../../MessageBubble/components/MessageHeader/MessageTimestamp',
    () => ({
        MessageTimestamp: () => <div>MessageTimestamp</div>,
    }),
)

vi.mock('../../MessageBubble/components/MessageBody', () => ({
    MessageBody: () => <div>MessageBody</div>,
}))

vi.mock('../../MessageBubble/components/MessageFooter', () => ({
    MessageFooter: () => <div>MessageFooter</div>,
}))

vi.mock('../../MessageBubble/components/MessageErrors', () => ({
    MessageErrors: () => <div>MessageErrors</div>,
}))

vi.mock('../../TicketMessageActions/TicketMessageActions', () => ({
    TicketMessageActions: () => <div>TicketMessageActions</div>,
}))

vi.mock('../../TicketMessage/hooks/useDisplayedTicketMessage', () => ({
    useDisplayedTicketMessage: ({
        item,
    }: {
        item: TicketThreadRegularMessageItem
    }) => item,
}))

function createGroupedItem(): TicketThreadGroupedMessagesItem {
    const source = {
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
    }

    return {
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        datetime: '2024-03-21T11:00:00Z',
        data: [
            {
                _tag: TicketThreadItemTag.Messages.Message,
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
                    source,
                    sender: {
                        id: 1,
                        name: 'Agent Smith',
                        firstname: 'Agent',
                        lastname: 'Smith',
                        email: 'agent@example.com',
                        meta: null,
                    },
                }) as TicketThreadRegularMessageItem['data'],
            },
            {
                _tag: TicketThreadItemTag.Messages.Message,
                datetime: '2024-03-21T11:03:00Z',
                data: mockTicketMessage({
                    id: 2,
                    ticket_id: 123,
                    channel: 'email',
                    via: 'email',
                    body_html: null,
                    stripped_html: null,
                    body_text: 'follow up',
                    stripped_text: 'follow up',
                    attachments: [],
                    source,
                    sender: {
                        id: 1,
                        name: 'Agent Smith',
                        firstname: 'Agent',
                        lastname: 'Smith',
                        email: 'agent@example.com',
                        meta: null,
                    },
                }) as TicketThreadRegularMessageItem['data'],
            },
        ],
    }
}

describe('TicketThreadGroupedMessages tooltip', () => {
    beforeEach(() => {
        messageChannelSpy.mockClear()
    })

    it('passes the first message source details to the grouped header channel tooltip', () => {
        render(<TicketThreadGroupedMessages item={createGroupedItem()} />)

        expect(messageChannelSpy.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                from: 'Support Team (support@example.com)',
                to: 'Alice (alice@example.com)',
                cc: 'Manager (manager@example.com)',
                bcc: 'Audit (audit@example.com)',
            }),
        )
    })
})
