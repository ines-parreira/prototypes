import { FilterStatus } from '@knocklabs/react'
import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import useCount from '../../hooks/useCount'
import FeedHeader from '../FeedHeader'

const mockUseFeedStore = jest.fn()
const mockMarkAllAsRead = jest.fn()
jest.mock(
    '@knocklabs/react',
    () =>
        ({
            ...jest.requireActual('@knocklabs/react'),
            useKnockFeed: () => ({
                useFeedStore: mockUseFeedStore,
                feedClient: {
                    markAllAsRead: mockMarkAllAsRead,
                },
            }),
        }) as Record<string, unknown>,
)

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        NotificationCenter: 'notification-center',
    },
    NotificationCenterEventTypes: {
        Filter: 'filter',
        GoToSettings: 'go-to-settings',
        MarkAllAsRead: 'mark-all-as-read',
    },
}))

jest.mock('../../hooks/useCount', () => jest.fn())
const useCountMock = assumeMock(useCount)

describe('<FeedHeader />', () => {
    const props = {
        filterStatus: FilterStatus.All,
        setFilterStatus: jest.fn(),
        onToggleVisibility: jest.fn(),
    }

    beforeEach(() => {
        useCountMock.mockReturnValue(0)
        mockUseFeedStore.mockReturnValue(0)
    })

    it('should render feed header', () => {
        render(
            <MemoryRouter>
                <FeedHeader {...props} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Mark all as read')).toBeInTheDocument()
    })

    it('should trigger Mark all as read action', () => {
        useCountMock.mockReturnValue(1)

        render(
            <MemoryRouter>
                <FeedHeader {...props} />
            </MemoryRouter>,
        )

        screen.getByText('Mark all as read').click()

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.MarkAllAsRead,
        })
        expect(mockMarkAllAsRead).toHaveBeenCalled()
    })

    it('should trigger the change of filtered notification status', async () => {
        useCountMock.mockReturnValue(1)
        const newStatus = 'unread'

        render(
            <MemoryRouter>
                <FeedHeader {...props} />
            </MemoryRouter>,
        )

        screen.getByText('all').click()

        await screen.findByText(new RegExp(newStatus, 'i'))
        screen.getByText(new RegExp(newStatus, 'i')).click()

        await waitFor(() => {
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.NotificationCenter,
                {
                    type: NotificationCenterEventTypes.Filter,
                    value: newStatus,
                },
            )
            expect(props.setFilterStatus).toHaveBeenCalledWith(newStatus)
        })
    })

    it('should trigger the redirect to settings', () => {
        render(
            <MemoryRouter>
                <FeedHeader {...props} />
            </MemoryRouter>,
        )

        screen.getByText('settings').click()

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.GoToSettings,
        })
        expect(props.onToggleVisibility).toHaveBeenCalled()
    })
})
