import type { ReactNode } from 'react'

import {
    mockListTicketTagsHandler,
    mockTicketMessage,
    mockTicketMessageSource,
    mockTicketMessageSourceAddress,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import type { MessageChannelProps } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { TicketMessage } from './TicketMessage'

const messageChannelSpy = vi.fn()

vi.mock('../MessageBubble/MessageBubble', () => ({
    MessageBubble: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
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

beforeEach(() => {
    server.use(
        mockListTicketTagsHandler().handler,
        getCurrentUserHandler().handler,
    )
})

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
            meta: {
                current_page: 'https://example.com/products/sneakers',
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
    })

    it('passes formatted from, to, cc, and bcc labels to the channel tooltip', () => {
        render(<TicketMessage item={createItem()} />)

        expect(messageChannelSpy.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                from: 'Support Team (support@example.com)',
                to: 'Alice (alice@example.com), Billing (billing@example.com)',
                cc: 'Manager (manager@example.com)',
                bcc: 'Audit (audit@example.com)',
                currentPageUrl: 'https://example.com/products/sneakers',
            }),
        )
    })
})
