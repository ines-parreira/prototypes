import React from 'react'
import type { ReactNode } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useToasts } from '../../hooks/useToasts'
import type { Notification } from '../../types'
import { Toasts } from '../Toasts'

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

jest.mock('../../hooks/useToasts', () => ({ useToasts: jest.fn() }))

jest.mock('../../data', () => ({
    notifications: {
        'ticket-message.created': {
            component: ({ notification }: { notification: Notification }) => (
                <span>{notification.id}</span>
            ),
        },
    },
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const useKnockFeedMock = assumeMock(useKnockFeed)
const useToastsMock = useToasts as unknown as jest.Mock

function makeNotifications(count: number): Notification[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `notification-${i + 1}`,
        type: 'ticket-message.created',
        inserted_datetime: '2021-09-01T00:00:00Z',
        read_datetime: null,
        seen_datetime: null,
        payload: null,
    })) as unknown as Notification[]
}

describe('<Toasts />', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        useKnockFeedMock.mockReturnValue({
            feedClient: {
                getState: jest.fn().mockReturnValue({ items: [] }),
                markAsRead: jest.fn(),
            },
        } as unknown as ReturnType<typeof useKnockFeed>)
        useToastsMock.mockReturnValue({
            dismiss: jest.fn(),
            notifications: [],
        })
    })

    describe('without wayfinding flag', () => {
        it('should render all notifications', () => {
            useToastsMock.mockReturnValue({
                dismiss: jest.fn(),
                notifications: makeNotifications(5),
            })

            render(<Toasts />)

            expect(screen.getAllByText(/^notification-/)).toHaveLength(5)
        })
    })

    describe('with wayfinding flag', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should cap rendered notifications at 3', () => {
            useToastsMock.mockReturnValue({
                dismiss: jest.fn(),
                notifications: makeNotifications(5),
            })

            render(<Toasts />)

            expect(screen.getAllByText(/^notification-/)).toHaveLength(3)
        })

        it('should render all notifications when fewer than 3 exist', () => {
            useToastsMock.mockReturnValue({
                dismiss: jest.fn(),
                notifications: makeNotifications(2),
            })

            render(<Toasts />)

            expect(screen.getAllByText(/^notification-/)).toHaveLength(2)
        })

        it('should show the most recent 3 notifications', () => {
            useToastsMock.mockReturnValue({
                dismiss: jest.fn(),
                notifications: makeNotifications(5),
            })

            render(<Toasts />)

            // notifications are reversed before capping, so the last-added ones
            // (highest ids) are shown
            expect(screen.queryByText('notification-1')).not.toBeInTheDocument()
            expect(screen.queryByText('notification-2')).not.toBeInTheDocument()
            expect(screen.getByText('notification-3')).toBeInTheDocument()
            expect(screen.getByText('notification-4')).toBeInTheDocument()
            expect(screen.getByText('notification-5')).toBeInTheDocument()
        })
    })
})
