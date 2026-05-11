import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../../types'
import UserMentionedNotification from '../UserMentionedNotification'

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

const notification = {
    id: '1',
    inserted_datetime: '2021-09-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
    type: 'user.mentioned',
    payload: {
        sender: {
            id: 456,
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
        },
        ticket: {
            id: 123,
            channel: TicketChannel.Email,
            excerpt: 'Magical ticket excerpt',
            sender: {
                id: 457,
                name: 'Jane Doe',
                firstName: 'Jane',
                lastName: 'Doe',
            },
            status: TicketStatus.Open,
            subject: 'Awesome ticket subject',
        },
    },
} as unknown as Notification<TicketPayload>

describe('UserMentionedNotification', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should render the notification with a sender', () => {
            const { getByText } = render(
                <UserMentionedNotification notification={notification} />,
            )
            expect(getByText('New mention')).toBeInTheDocument()
            expect(
                getByText(
                    (_, el) =>
                        el?.textContent ===
                        'John Doe mentioned you in Awesome ticket subject',
                ),
            ).toBeInTheDocument()
            expect(getByText('Magical ticket excerpt')).toBeInTheDocument()
        })

        it('should render the notification without a sender', () => {
            const { getByText } = render(
                <UserMentionedNotification
                    notification={{
                        ...notification,
                        payload: { ...notification.payload, sender: undefined },
                    }}
                />,
            )
            expect(getByText('New mention')).toBeInTheDocument()
            expect(
                getByText(
                    (_, el) =>
                        el?.textContent ===
                        'You were mentioned in Awesome ticket subject',
                ),
            ).toBeInTheDocument()
            expect(getByText('Magical ticket excerpt')).toBeInTheDocument()
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the title', () => {
            const { getByText } = render(
                <UserMentionedNotification notification={notification} />,
            )
            expect(getByText('New mention')).toBeInTheDocument()
        })

        it('should render sender name and ticket subject when sender exists', () => {
            const { getByText } = render(
                <UserMentionedNotification notification={notification} />,
            )
            expect(getByText('John Doe')).toBeInTheDocument()
            expect(getByText('Awesome ticket subject')).toBeInTheDocument()
        })

        it('should render fallback text when sender is absent', () => {
            const { getByText } = render(
                <UserMentionedNotification
                    notification={{
                        ...notification,
                        payload: { ...notification.payload, sender: undefined },
                    }}
                />,
            )
            expect(
                getByText(
                    (_, el) =>
                        el?.textContent ===
                        'You were mentioned in Awesome ticket subject',
                ),
            ).toBeInTheDocument()
        })

        it('should render the excerpt', () => {
            const { getByText } = render(
                <UserMentionedNotification notification={notification} />,
            )
            expect(getByText('Magical ticket excerpt')).toBeInTheDocument()
        })

        it('should link to the ticket', () => {
            const { container } = render(
                <UserMentionedNotification notification={notification} />,
            )
            expect(
                container.querySelector('a[href="/app/ticket/123"]'),
            ).toBeInTheDocument()
        })
    })
})
