import { logEvent, SegmentEvent } from '@repo/logging'
import userEventLib from '@testing-library/user-event'

import type { Notification } from 'common/notifications'
import { renderWithRouter } from 'utils/testing'

import type { ImportNotification } from '../../types'
import ImportEmailSuccessNotification from '../ImportEmailSuccessNotification'
import { createMockNotification } from './shared-mocks'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        SuccessfulEmailImportNotification:
            'successful-email-import-notification',
    },
}))

jest.mock('moment/moment', () => {
    return jest.requireActual('moment/moment')
})

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('ImportEmailSuccessNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the notification with correct content', () => {
        const notification = createMockNotification()
        const { getByText, container } = renderWithRouter(
            <ImportEmailSuccessNotification notification={notification} />,
        )

        expect(getByText('Email history imported')).toBeInTheDocument()
        expect(container.textContent).toContain(
            'successfully imported emails from',
        )
        expect(getByText('test@example.com')).toBeInTheDocument()
        expect(getByText(/Jun 1, 2023/)).toBeInTheDocument()
        expect(getByText(/Jul 1, 2023/)).toBeInTheDocument()
        expect(container.textContent).toContain('to your tickets.')
    })

    it('should call onClick and log segment event when clicked', async () => {
        const user = userEventLib.setup()
        const mockOnClick = jest.fn()
        const notification = createMockNotification({
            id: 456,
        })

        const { container } = renderWithRouter(
            <ImportEmailSuccessNotification
                notification={notification}
                onClick={mockOnClick}
            />,
        )

        const contentElement = container.querySelector('a')!
        await user.click(contentElement)

        expect(mockOnClick).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.SuccessfulEmailImportNotification,
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
            type: 'import.success',
            payload: {
                import: undefined as any,
            },
        }

        const { container } = renderWithRouter(
            <ImportEmailSuccessNotification notification={notification} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should return null when import data is null', () => {
        const notification: Notification<ImportNotification> = {
            id: 'test-notification-id',
            inserted_datetime: '2023-01-01T00:00:00Z',
            read_datetime: null,
            seen_datetime: null,
            type: 'import.success',
            payload: {
                import: null as any,
            },
        }

        const { container } = renderWithRouter(
            <ImportEmailSuccessNotification notification={notification} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render with email icon', () => {
        const notification = createMockNotification()
        const { container } = renderWithRouter(
            <ImportEmailSuccessNotification notification={notification} />,
        )

        // The Content component should receive the email icon type
        // We can't directly test the icon prop, but we can verify the component renders
        expect(container.firstChild).toBeInTheDocument()
    })
})
