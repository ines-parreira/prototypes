import type { ReactNode } from 'react'

import { render } from '@testing-library/react'

import {
    mockTicketMessage,
    mockTicketMessageSource,
} from '@gorgias/helpdesk-mocks'

import { TicketThreadItemTag } from '#thread/itemTags'
import { TicketThreadPendingState } from '#ticket-messages/types'
import type { TicketThreadSocialMediaWhatsAppMessageItem } from '#ticket-messages/types'
import { SocialMessageBubble } from './SocialMessageBubble'

const messageBubbleSpy = vi.fn()

vi.mock('#ticket-messages/components/MessageBubble/MessageBubble', () => ({
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

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout',
    () => ({
        MessageHeaderContainer: ({ children }: { children: ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar',
    () => ({
        MessageAvatar: () => <div>MessageAvatar</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender',
    () => ({
        MessageSender: () => <div>MessageSender</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel',
    () => ({
        MessageChannel: () => <div>MessageChannel</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageDeliveryIcon',
    () => ({
        MessageDeliveryIcon: () => <div>MessageDeliveryIcon</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp',
    () => ({
        MessageTimestamp: () => <div>MessageTimestamp</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/MessageErrors',
    () => ({
        MessageErrors: () => <div>MessageErrors</div>,
    }),
)

vi.mock(
    '#ticket-messages/components/MessageBubble/components/PendingMessageBanner',
    () => ({
        PendingMessageBanner: () => <div>PendingMessageBanner</div>,
    }),
)

vi.mock('./GoToLinkFooter', () => ({
    GoToLinkFooter: () => <div>GoToLinkFooter</div>,
}))

function createItem(): TicketThreadSocialMediaWhatsAppMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
        datetime: '2024-03-21T11:00:00Z',
        data: mockTicketMessage({
            id: 1,
            ticket_id: 123,
            channel: 'whatsapp',
            via: 'api',
            body_html: null,
            stripped_html: null,
            body_text: 'hello',
            stripped_text: 'hello',
            attachments: [],
            from_agent: true,
            source: {
                ...mockTicketMessageSource({ type: 'whatsapp' }),
                type: 'whatsapp',
            },
            sender: {
                id: 1,
                name: 'Agent Smith',
                firstname: 'Agent',
                lastname: 'Smith',
                email: 'agent@example.com',
                meta: null,
            },
        }) as TicketThreadSocialMediaWhatsAppMessageItem['data'],
    }
}

describe('SocialMessageBubble', () => {
    beforeEach(() => {
        messageBubbleSpy.mockClear()
    })

    it('passes the active pending state to the message bubble', () => {
        render(
            <SocialMessageBubble
                item={{
                    ...createItem(),
                    pendingState: TicketThreadPendingState.Active,
                }}
            >
                <div>Content</div>
            </SocialMessageBubble>,
        )

        expect(messageBubbleSpy).toHaveBeenCalledWith({
            pendingState: TicketThreadPendingState.Active,
        })
    })

    it('passes the failed pending state to the message bubble', () => {
        render(
            <SocialMessageBubble
                item={{
                    ...createItem(),
                    pendingState: TicketThreadPendingState.Failed,
                }}
            >
                <div>Content</div>
            </SocialMessageBubble>,
        )

        expect(messageBubbleSpy).toHaveBeenCalledWith({
            pendingState: TicketThreadPendingState.Failed,
        })
    })
})
