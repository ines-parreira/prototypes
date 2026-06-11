import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'

import type { Notification } from 'common/notifications'

import type { EmailDomainPayload } from '../../types'
import { DomainVerificationNotification } from '../DomainVerificationNotification'

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
    inserted_datetime: '2024-11-04T13:07:00',
    read_datetime: null,
    seen_datetime: null,
    type: 'user.mentioned',
    payload: {
        domain: 'example.com',
    },
} as Notification<EmailDomainPayload>

describe('DomainVerificationNotification', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should render the notification title and content', () => {
            const { getByText } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(
                getByText('Domain verification complete'),
            ).toBeInTheDocument()
            expect(
                getByText(
                    (_, el) => el?.textContent === 'System update from Gorgias',
                ),
            ).toBeInTheDocument()
            expect(
                getByText(
                    'Your domain has been verified! You can now send emails with Gorgias using addresses ending in @example.com.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the notification title', () => {
            const { getByText } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(
                getByText('Domain verification complete'),
            ).toBeInTheDocument()
        })

        it('should render sender info', () => {
            const { getByText } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(
                getByText(
                    (_, el) => el?.textContent === 'System update from Gorgias',
                ),
            ).toBeInTheDocument()
        })

        it('should render the domain verification excerpt', () => {
            const { getByText } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(
                getByText(
                    'Your domain has been verified! You can now send emails with Gorgias using addresses ending in @example.com.',
                ),
            ).toBeInTheDocument()
        })

        it('should link to the email settings page', () => {
            const { container } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(
                container.querySelector(
                    'a[href="/app/settings/channels/email"]',
                ),
            ).toBeInTheDocument()
        })

        it('should call onClick when provided', () => {
            const onClick = jest.fn()
            const { container } = render(
                <DomainVerificationNotification
                    notification={notification}
                    onClick={onClick}
                />,
            )
            const link = container.querySelector('a')!
            link.click()
            expect(onClick).toHaveBeenCalled()
        })

        it('should render the system message icon from ticketMessageSourceToIconName', () => {
            const { getByRole } = render(
                <DomainVerificationNotification notification={notification} />,
            )
            expect(getByRole('img', { name: 'mail' })).toBeInTheDocument()
        })
    })
})
