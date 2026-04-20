import type { ReactNode } from 'react'

import { render } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { TicketThreadPendingState } from '../../hooks/messages/types'
import type { TicketThreadInternalNoteItem } from '../../hooks/messages/types'
import { TicketInternalNote } from './TicketInternalNote'

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
    MessageChannel: () => <div>MessageChannel</div>,
}))

vi.mock('../MessageBubble/components/MessageHeader/MessageTimestamp', () => ({
    MessageTimestamp: () => <div>MessageTimestamp</div>,
}))

vi.mock('../MessageBubble/components/MessageBody', () => ({
    MessageBody: () => <div>MessageBody</div>,
}))

vi.mock('../MessageBubble/components/MessageFooter', () => ({
    MessageFooter: () => <div>MessageFooter</div>,
}))

vi.mock('../TicketMessageActions/TicketMessageActions', () => ({
    TicketMessageActions: () => <div>TicketMessageActions</div>,
}))

function createItem(): TicketThreadInternalNoteItem {
    return {
        _tag: 'internal-note',
        datetime: '2024-03-21T11:00:00Z',
        data: mockTicketMessage({
            id: 1,
            ticket_id: 123,
            public: false,
            channel: 'email',
            via: 'rule',
            body_html: null,
            stripped_html: null,
            body_text: 'internal note',
            stripped_text: 'internal note',
            attachments: [],
            from_agent: true,
            sender: {
                id: 1,
                name: 'Agent Smith',
                firstname: 'Agent',
                lastname: 'Smith',
                email: 'agent@example.com',
                meta: null,
            },
        }) as TicketThreadInternalNoteItem['data'],
    }
}

describe('TicketInternalNote', () => {
    beforeEach(() => {
        messageBubbleSpy.mockClear()
    })

    it('passes the active pending state to the message bubble', () => {
        render(
            <TicketInternalNote
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
            <TicketInternalNote
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
