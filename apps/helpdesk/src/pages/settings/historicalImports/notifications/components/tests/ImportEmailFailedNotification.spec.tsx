import { logEvent, SegmentEvent } from '@repo/logging'
import user from '@testing-library/user-event'

import type { Notification } from 'common/notifications'
import { renderWithRouter } from 'utils/testing'

import type { ImportNotification } from '../../types'
import ImportEmailFailedNotification from '../ImportEmailFailedNotification'
import { createMockFailedNotification } from './shared-mocks'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        FailedEmailImportNotification: 'failed-email-import-notification',
    },
}))

jest.mock('moment/moment', () => {
    return jest.requireActual('moment/moment')
})

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('ImportEmailFailedNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the notification with correct content', () => {
        const notification = createMockFailedNotification()
        const { getByText, container } = renderWithRouter(
            <ImportEmailFailedNotification notification={notification} />,
        )

        expect(getByText('Email import failed')).toBeInTheDocument()
        expect(container.textContent).toContain(
            'complete the import of historical emails',
        )
        expect(getByText('test@example.com')).toBeInTheDocument()
        expect(getByText(/Jun 1, 2023/)).toBeInTheDocument()
        expect(getByText(/Jul 1, 2023/)).toBeInTheDocument()
        expect(container.textContent).toContain('Please try again later.')
    })

    it('should call onClick and log segment event when clicked', async () => {
        const userEvents = user.setup()
        const mockOnClick = jest.fn()
        const notification = createMockFailedNotification({
            id: 456,
        })

        const { container } = renderWithRouter(
            <ImportEmailFailedNotification
                notification={notification}
                onClick={mockOnClick}
            />,
        )

        const contentElement = container.querySelector('a')!
        await userEvents.click(contentElement)

        expect(mockOnClick).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.FailedEmailImportNotification,
            {
                importId: 456,
            },
        )
    })

    it('should return null when import data is missing', () => {
        const notification: Notification<ImportNotification> = {
            id: 'test-notification-id',
            inserted_datetime: '2023-01-01T00:00:00Z',
            read_datetime: null,
            seen_datetime: null,
            type: 'import.failed',
            payload: {
                import: undefined as any,
            },
        }

        const { container } = renderWithRouter(
            <ImportEmailFailedNotification notification={notification} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should return null when import data is null', () => {
        const notification: Notification<ImportNotification> = {
            id: 'test-notification-id',
            inserted_datetime: '2023-01-01T00:00:00Z',
            read_datetime: null,
            seen_datetime: null,
            type: 'import.failed',
            payload: {
                import: null as any,
            },
        }

        const { container } = renderWithRouter(
            <ImportEmailFailedNotification notification={notification} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
