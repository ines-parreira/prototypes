import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../../types'
import { TicketNotification } from '../TicketNotification'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

jest.mock('@knocklabs/react', () => ({
    useKnockFeed: jest.fn(),
    useKnockClient: jest.fn(),
    FilterStatus: {
        All: 'all',
        Read: 'read',
        Unseen: 'unseen',
        Unread: 'unread',
    },
    NotificationFeed: () => null,
    KnockFeedProvider: ({ children }: { children: ReactNode }) => children,
    KnockProvider: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('@repo/tickets', () => ({
    ticketMessageSourceToIconName: jest.fn().mockReturnValue('mail'),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const useKnockFeedMock = assumeMock(useKnockFeed)

const notification: Notification<TicketPayload> = {
    id: '1',
    inserted_datetime: '2021-09-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
    type: 'ticket-message.created',
    payload: {
        ticket: {
            id: 1,
            channel: TicketChannel.Email,
            status: TicketStatus.Open,
            subject: 'Test ticket',
            excerpt: 'Excerpt',
        },
        sender: {
            id: 1,
            name: 'John Doe',
            firstname: 'John',
            lastname: 'Doe',
        },
    },
}

describe('<TicketNotification />', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should render notification content', () => {
            const { getByText } = render(
                <TicketNotification
                    notification={notification}
                    headerExtra="extra"
                />,
            )

            expect(getByText('New message')).toBeInTheDocument()
            expect(getByText('extra')).toBeInTheDocument()
            expect(getByText('Excerpt')).toBeInTheDocument()
        })

        it('should render regular notification icon for assigned type', () => {
            const { getByText } = render(
                <TicketNotification
                    notification={{
                        ...notification,
                        payload: { ticket: notification.payload.ticket },
                        type: 'ticket.assigned',
                    }}
                />,
            )

            expect(getByText('person')).toBeInTheDocument()
            expect(getByText('person')).toHaveClass('material-icons')
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render title "New message" for new message type', () => {
            const { getByText } = render(
                <TicketNotification notification={notification} />,
            )
            expect(getByText('New message')).toBeInTheDocument()
        })

        it('should render overridden title for assigned type', () => {
            const { getByRole, getByText } = render(
                <TicketNotification
                    notification={{ ...notification, type: 'ticket.assigned' }}
                />,
            )
            expect(
                getByText("You've been assigned to a ticket"),
            ).toBeInTheDocument()
            expect(
                getByRole('img', { name: 'mail' }).closest('[data-color]'),
            ).toHaveAttribute('data-color', 'teal')
        })

        it('should render the ticket subject', () => {
            const { getByText } = render(
                <TicketNotification notification={notification} />,
            )
            expect(getByText('Test ticket')).toBeInTheDocument()
        })

        it('should render the sender name', () => {
            const { getByText } = render(
                <TicketNotification notification={notification} />,
            )
            expect(getByText('John Doe')).toBeInTheDocument()
        })

        it('should render the excerpt', () => {
            const { getByText } = render(
                <TicketNotification notification={notification} />,
            )
            expect(getByText('Excerpt')).toBeInTheDocument()
        })

        it('should link to the ticket', () => {
            const { container } = render(
                <TicketNotification notification={notification} />,
            )
            expect(
                container.querySelector('a[href="/app/ticket/1"]'),
            ).toBeInTheDocument()
        })

        it('should render the channel icon from ticketMessageSourceToIconName', () => {
            const { getByRole } = render(
                <TicketNotification notification={notification} />,
            )
            const icon = getByRole('img', { name: 'mail' })
            expect(icon).toBeInTheDocument()
            expect(icon.closest('[data-color]')).toHaveAttribute(
                'data-color',
                'blue',
            )
        })
    })
})
