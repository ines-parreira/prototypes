import {FilterStatus, NotificationFeedPopover} from '@knocklabs/react'
import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from 'common/segment'

import Button from '../Button'

const mockMarkAsRead = jest.fn()
const mockMarkAsUnread = jest.fn()
const mockUseFeedStore = jest.fn()
const MockNotificationFeedPopover = 'MockNotificationFeedPopover'

const item = {
    id: '1',
    data: {
        type: 'ticket.assigned',
        payload: {
            ticket: {},
        },
    },
    inserted_at: '2024-10-25T19:15:01.313273+00:00',
}

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        NotificationCenter: 'notification-center',
    },
    NotificationCenterEventTypes: {
        FeedItemClicked: 'feed-item-clicked',
        GoToSettings: 'go-to-settings',
        Opened: 'opened',
        StatusToggled: 'status-toggled',
    },
}))

const mockFilterStatus = FilterStatus.All
const mockGetState = jest.fn()
let mockItem = item

jest.mock(
    '@knocklabs/react',
    () =>
        ({
            ...jest.requireActual('@knocklabs/react'),
            NotificationFeedPopover: ({
                renderHeader,
                renderItem,
            }: ComponentProps<typeof NotificationFeedPopover>) => (
                <div>
                    {renderHeader?.({
                        filterStatus: mockFilterStatus,
                        setFilterStatus: () => {},
                    })}
                    {renderItem?.({
                        item: mockItem,
                    } as any)}

                    {MockNotificationFeedPopover}
                </div>
            ),
            useKnockFeed: () => ({
                feedClient: {
                    markAsRead: mockMarkAsRead,
                    markAsUnread: mockMarkAsUnread,
                    store: {
                        getState: mockGetState,
                    },
                },
                useFeedStore: mockUseFeedStore,
            }),
        }) as Record<string, unknown>
)

describe('<Button />', () => {
    beforeEach(() => {
        mockUseFeedStore.mockReturnValue(0)
        mockItem = item
        mockGetState.mockImplementation(() => ({
            items: [mockItem],
        }))
    })

    it('should display notification feed', () => {
        render(<Button />)

        expect(screen.getAllByText('Notifications')).toHaveLength(2)
    })

    it('should display notification count', () => {
        mockUseFeedStore.mockReturnValue(11)

        render(<Button />)

        expect(screen.getByText('11')).toBeInTheDocument()
    })

    it('should mark as read an unread notification on toggle', () => {
        render(<Button />)

        screen.getByText('check_box').click()

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.StatusToggled,
            status: 'read',
        })
        expect(mockMarkAsRead).toHaveBeenCalled()
    })

    it('should mark as unread a read notification on toggle', () => {
        const readItem = {
            ...item,
            read_at: 'x',
        }
        mockItem = readItem
        mockGetState.mockImplementation(() => ({
            items: [readItem],
        }))
        render(<Button />)

        const buttons = screen.getAllByRole('button')
        buttons[buttons.length - 1].click()

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.StatusToggled,
            status: 'unread',
        })
        expect(mockMarkAsUnread).toHaveBeenCalled()
    })

    it('should mark as read an unread notification on item click', () => {
        render(<Button />)

        screen.getByText('You’ve been assigned to a ticket').click()

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.FeedItemClicked,
        })
        expect(mockMarkAsRead).toHaveBeenCalled()
    })
})
