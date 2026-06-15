import type { ReactNode } from 'react'

import { screen } from '@testing-library/react'

import {
    mockListTicketTagsHandler,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadPendingState } from '../../types'
import type { TicketThreadInternalNoteItem } from '../../types'
import { TicketInternalNote } from './TicketInternalNote'

const messageBubbleSpy = vi.fn()
const messageErrorsSpy = vi.fn()

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

vi.mock('../MessageBubble/components/MessageErrors', () => ({
    MessageErrors: (props: {
        isPending?: boolean
        message: TicketThreadInternalNoteItem['data']
        ticketId: number
    }) => {
        messageErrorsSpy(props)

        return <div>MessageErrors</div>
    },
}))

vi.mock('../MessageBubble/components/MessageAppliedActions', () => ({
    MessageAppliedActions: () => <div>MessageAppliedActions</div>,
}))

vi.mock('../TicketMessageActions/TicketMessageActions', () => ({
    TicketMessageActions: () => <div>TicketMessageActions</div>,
}))

beforeEach(() => {
    messageBubbleSpy.mockClear()
    messageErrorsSpy.mockClear()

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

    it('renders message errors with the internal note ticket context', () => {
        const item = createItem()

        render(<TicketInternalNote item={item} />)

        expect(screen.getByText('MessageErrors')).toBeInTheDocument()
        expect(messageErrorsSpy).toHaveBeenCalledWith({
            isPending: false,
            message: item.data,
            ticketId: 123,
        })
    })

    it('passes the pending state through to message errors', () => {
        const item = {
            ...createItem(),
            pendingState: TicketThreadPendingState.Active,
        }

        render(<TicketInternalNote item={item} />)

        expect(messageErrorsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                isPending: true,
                ticketId: 123,
            }),
        )
    })

    it('does not render message errors when the internal note has no ticket id', () => {
        const item = {
            ...createItem(),
            data: {
                ...createItem().data,
                ticket_id: 0,
            } as TicketThreadInternalNoteItem['data'],
        }

        render(<TicketInternalNote item={item} />)

        expect(screen.queryByText('MessageErrors')).not.toBeInTheDocument()
        expect(messageErrorsSpy).not.toHaveBeenCalled()
    })
})
