import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import user from '@testing-library/user-event'

import type { Notification } from 'common/notifications'

import type { ImportNotification } from '../../types'
import { ImportEmailFailedNotification } from '../ImportEmailFailedNotification'
import { createMockFailedNotification } from './shared-mocks'

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
        FailedEmailImportNotification: 'failed-email-import-notification',
    },
}))

jest.mock('moment/moment', () => {
    return jest.requireActual('moment/moment')
})

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const useKnockFeedMock = assumeMock(useKnockFeed)
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('ImportEmailFailedNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead: jest.fn(), markAsUnread: jest.fn() },
            useFeedStore: (selector: (state: { items: [] }) => unknown) =>
                selector({ items: [] }),
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should render the notification with correct content', () => {
            const notification = createMockFailedNotification()
            const { getByText, container } = render(
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
            const notification = createMockFailedNotification({ id: 456 })

            const { container } = render(
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
                { importId: 456 },
            )
        })

        it('should return null when import data is missing', () => {
            const notification: Notification<ImportNotification> = {
                id: 'test-notification-id',
                inserted_datetime: '2023-01-01T00:00:00Z',
                read_datetime: null,
                seen_datetime: null,
                type: 'import.failed',
                payload: { import: undefined as any },
            }

            const { container } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should render the notification title', () => {
            const notification = createMockFailedNotification()
            const { getByText } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )
            expect(getByText('Email import failed')).toBeInTheDocument()
        })

        it('should render provider identifier', () => {
            const notification = createMockFailedNotification()
            const { getByText } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )
            expect(getByText('test@example.com')).toBeInTheDocument()
        })

        it('should render date range', () => {
            const notification = createMockFailedNotification()
            const { container } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )
            expect(container.textContent).toContain('2023')
        })

        it('should return null when import data is missing', () => {
            const notification: Notification<ImportNotification> = {
                id: 'test-notification-id',
                inserted_datetime: '2023-01-01T00:00:00Z',
                read_datetime: null,
                seen_datetime: null,
                type: 'import.failed',
                payload: { import: undefined as any },
            }

            const { container } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should call onClick and log segment event when clicked', async () => {
            const userEvents = user.setup()
            const mockOnClick = jest.fn()
            const notification = createMockFailedNotification({ id: 456 })

            const { container } = render(
                <ImportEmailFailedNotification
                    notification={notification}
                    onClick={mockOnClick}
                />,
            )

            await userEvents.click(container.querySelector('a')!)

            expect(mockOnClick).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.FailedEmailImportNotification,
                { importId: 456 },
            )
        })

        it('should render the error-octagon icon', () => {
            const notification = createMockFailedNotification()
            const { getByRole } = render(
                <ImportEmailFailedNotification notification={notification} />,
            )
            expect(
                getByRole('img', { name: 'error-octagon' }),
            ).toBeInTheDocument()
        })
    })
})
