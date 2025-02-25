import React from 'react'
import type { ComponentProps } from 'react'

import { NotificationFeed, useKnockFeed } from '@knocklabs/react'
import type { RenderItemProps } from '@knocklabs/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from 'common/segment'
import { assumeMock } from 'utils/testing'

import Feed from '../Feed'
import FeedHeader from '../FeedHeader'
import FeedItem from '../FeedItem'

let mockItem: RenderItemProps['item']

jest.mock('@knocklabs/react', () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const actual = jest.requireActual(
        '@knocklabs/react',
    ) as typeof import('@knocklabs/react')
    const { FilterStatus } = actual
    return {
        ...actual,
        NotificationFeed: ({
            renderHeader,
            renderItem,
        }: ComponentProps<typeof NotificationFeed>) => (
            <div>
                {renderHeader?.({
                    filterStatus: FilterStatus.All,
                    setFilterStatus: () => {},
                })}
                {renderItem?.({
                    item: mockItem,
                } as unknown as RenderItemProps)}
                <div>KnockNotificationFeed</div>
            </div>
        ),
        useKnockFeed: jest.fn(),
    } as typeof import('@knocklabs/react')
})
const useKnockFeedMock = assumeMock(useKnockFeed)

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
)
jest.mock(
    '../FeedHeader',
    () =>
        ({ onToggleVisibility }: ComponentProps<typeof FeedHeader>) => (
            <div>
                <p>FeedHeader</p>
                <button type="button" onClick={onToggleVisibility}>
                    onClose
                </button>
            </div>
        ),
)
jest.mock(
    '../FeedItem',
    () =>
        ({ onClick, onToggleRead }: ComponentProps<typeof FeedItem>) => (
            <div onClick={onClick}>
                <p>FeedItem</p>
                <button type="button" onClick={onToggleRead}>
                    onToggleRead
                </button>
            </div>
        ),
)

const defaultItem = {
    id: '1',
    data: {
        type: 'ticket.assigned',
        payload: {
            ticket: {},
        },
    },
    inserted_at: '2024-10-25T19:15:01.313273+00:00',
} as unknown as RenderItemProps['item']

describe('Feed', () => {
    let markAsRead: jest.Mock
    let markAsUnread: jest.Mock

    beforeEach(() => {
        markAsRead = jest.fn()
        markAsUnread = jest.fn()
        useKnockFeedMock.mockReturnValue({
            feedClient: { markAsRead, markAsUnread },
        } as unknown as ReturnType<typeof useKnockFeed>)

        mockItem = defaultItem
    })

    it('should display the notification feed', () => {
        render(<Feed />)
        expect(screen.getByText('FeedHeader')).toBeInTheDocument()
        expect(screen.getByText('FeedItem')).toBeInTheDocument()
        expect(screen.getByText('KnockNotificationFeed')).toBeInTheDocument()
    })

    it('should mark as read an unread notification on toggle', () => {
        render(<Feed />)
        userEvent.click(screen.getByText('onToggleRead'))
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.StatusToggled,
            status: 'read',
        })
        expect(markAsRead).toHaveBeenCalledWith(defaultItem)
    })

    it('should mark as unread a read notification on toggle', () => {
        const readItem = { ...defaultItem, read_at: '2024-12-19T23:16:00' }
        mockItem = readItem

        render(<Feed />)
        userEvent.click(screen.getByText('onToggleRead'))
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.StatusToggled,
            status: 'unread',
        })
        expect(markAsUnread).toHaveBeenCalledWith(readItem)
    })

    it('should mark as read an unread notification on item click', () => {
        const onClose = jest.fn()

        render(<Feed onClose={onClose} />)
        userEvent.click(screen.getByText('FeedItem'))
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.FeedItemClicked,
        })
        expect(markAsRead).toHaveBeenCalledWith(defaultItem)
        expect(onClose).toHaveBeenCalledWith()
    })

    it('should call the close callback if the header close button is called', () => {
        const onClose = jest.fn()

        render(<Feed onClose={onClose} />)
        userEvent.click(screen.getByText('onClose'))
        expect(onClose).toHaveBeenCalledWith()
    })
})
