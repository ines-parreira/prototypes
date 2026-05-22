import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../../types'
import MessageFailedNotification from '../MessageFailedNotification'

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

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        FailedMessageNotification: 'failed-message-notification',
    },
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const useKnockFeedMock = assumeMock(useKnockFeed)
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const notification: Notification<TicketPayload> = {
    id: '1',
    inserted_datetime: '2021-09-01T00:00:00Z',
    read_datetime: null,
    seen_datetime: null,
    type: 'ticket.last-message-failed',
    payload: {
        customer: {
            id: 5001,
            name: 'Foo Bar.',
            firstname: '',
            lastname: '',
        },
        ticket: {
            channel: TicketChannel.Email,
            id: 191,
            status: TicketStatus.Open,
            subject: '',
        },
    },
}

describe('<MessageFailedNotification />', () => {
    beforeEach(() => {
        mockLogEvent.mockClear()
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should render message failed content with error icon', () => {
            const { getByText } = render(
                <MessageFailedNotification
                    notification={notification}
                    headerExtra="extra"
                />,
            )

            expect(getByText('Message not delivered')).toBeInTheDocument()
            expect(getByText('extra')).toBeInTheDocument()
            expect(getByText('Foo Bar.')).toBeInTheDocument()
            expect(getByText('error')).toBeInTheDocument()
        })

        it('should not render name if it does not exist in payload', () => {
            const notificationWithoutName = {
                ...notification,
                payload: {
                    ...notification.payload,
                    customer: {
                        ...notification.payload.customer!,
                        name: null,
                    },
                },
            }

            const { getByText, queryByText } = render(
                <MessageFailedNotification
                    notification={notificationWithoutName}
                />,
            )

            expect(
                getByText('Message didn’t deliver. Please try again.'),
            ).toBeInTheDocument()
            expect(queryByText('Foo Bar.')).not.toBeInTheDocument()
        })

        it('should track segment event when notification is clicked', async () => {
            const user = userEvent.setup()

            const { container } = render(
                <MessageFailedNotification notification={notification} />,
            )

            await user.click(container.firstElementChild!)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.FailedMessageNotification,
                { ticketId: notification.payload.ticket.id },
            )
        })

        it('should call onClick when notification is clicked', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()
            const { container } = render(
                <MessageFailedNotification
                    notification={notification}
                    onClick={mockOnClick}
                />,
            )

            await user.click(container.firstElementChild!)

            expect(mockOnClick).toHaveBeenCalled()
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the notification title', () => {
            const { getByText } = render(
                <MessageFailedNotification notification={notification} />,
            )
            expect(getByText('Message not delivered')).toBeInTheDocument()
        })

        it('should render customer name in message', () => {
            const { getByText } = render(
                <MessageFailedNotification notification={notification} />,
            )
            expect(getByText('Foo Bar.')).toBeInTheDocument()
        })

        it('should render fallback message when customer name is absent', () => {
            const notificationWithoutName = {
                ...notification,
                payload: {
                    ...notification.payload,
                    customer: { ...notification.payload.customer!, name: null },
                },
            }
            const { getByText } = render(
                <MessageFailedNotification
                    notification={notificationWithoutName}
                />,
            )
            expect(
                getByText("Message didn't deliver. Please try again."),
            ).toBeInTheDocument()
        })

        it('should link to the ticket', () => {
            const { container } = render(
                <MessageFailedNotification notification={notification} />,
            )
            expect(
                container.querySelector('a[href="/app/ticket/191"]'),
            ).toBeInTheDocument()
        })

        it('should log segment event and call onClick when clicked', async () => {
            const user = userEvent.setup()
            const mockOnClick = jest.fn()
            const { container } = render(
                <MessageFailedNotification
                    notification={notification}
                    onClick={mockOnClick}
                />,
            )

            await user.click(container.querySelector('a')!)

            expect(mockOnClick).toHaveBeenCalled()
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.FailedMessageNotification,
                { ticketId: notification.payload.ticket.id },
            )
        })

        it('should render the error-octagon icon', () => {
            const { getByRole } = render(
                <MessageFailedNotification notification={notification} />,
            )
            expect(
                getByRole('img', { name: 'error-octagon' }),
            ).toBeInTheDocument()
        })
    })
})
