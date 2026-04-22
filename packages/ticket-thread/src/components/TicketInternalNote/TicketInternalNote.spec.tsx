import type { ReactNode } from 'react'

import {
    mockListTicketTagsHandler,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadInternalNoteItem } from '../../hooks/messages/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { TicketInternalNote } from './TicketInternalNote'

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

beforeEach(() => {
    server.use(
        mockListTicketTagsHandler().handler,
        getCurrentUserHandler().handler,
    )
})

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
    it('renders without errors', () => {
        const { container } = render(<TicketInternalNote item={createItem()} />)
        expect(container).not.toBeEmptyDOMElement()
    })
})
