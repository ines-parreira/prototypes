import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { Notification } from 'common/notifications'

import type { TicketPayload } from '../../types'
import MessageFailedNotification from '../MessageFailedNotification'

// Mock the segment tracking
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        FailedMessageNotification: 'failed-message-notification',
    },
}))

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
    })

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

    it('should not render name if it dont exist in payload', () => {
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
            {
                ticketId: notification.payload.ticket.id,
            },
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
