import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { NotificationItem } from '../hooks/useNotificationItems'
import { NotificationsPanel } from './NotificationsPanel'
import { NotificationTile } from './NotificationTile'

const makeItem = (
    overrides: Partial<NotificationItem> = {},
): NotificationItem =>
    ({
        id: overrides.id ?? 'notif-1',
        icon: 'bell',
        title: overrides.title ?? 'Notification title',
        createdDatetime: '2024-01-01T11:59:00Z',
        readDatetime: null,
        ...overrides,
    }) as NotificationItem

const renderPanel = (
    props: Partial<React.ComponentProps<typeof NotificationsPanel>> = {},
) =>
    render(
        <NotificationsPanel
            title="Notifications"
            toolbar={<div>Filter toolbar</div>}
            items={props.items ?? []}
            onMarkAllAsRead={props.onMarkAllAsRead ?? vi.fn()}
            onClose={props.onClose}
            onLoadMore={props.onLoadMore}
        >
            {props.children ??
                ((item) => <NotificationTile {...item} isListItem />)}
        </NotificationsPanel>,
    )

describe('NotificationsPanel', () => {
    it('renders the title and toolbar', () => {
        renderPanel()
        expect(screen.getByText('Notifications')).toBeInTheDocument()
        expect(screen.getByText('Filter toolbar')).toBeInTheDocument()
    })

    it('renders the empty state when there are no items', () => {
        renderPanel({ items: [] })
        expect(screen.getByText('No notifications')).toBeInTheDocument()
    })

    it('renders each item via the children render prop', () => {
        const items = [
            makeItem({ id: '1', title: 'First notification' }),
            makeItem({ id: '2', title: 'Second notification' }),
        ]
        renderPanel({ items })
        expect(screen.getByText('First notification')).toBeInTheDocument()
        expect(screen.getByText('Second notification')).toBeInTheDocument()
        expect(screen.queryByText('No notifications')).not.toBeInTheDocument()
    })

    it('exposes the notification list with an accessible label', () => {
        renderPanel({ items: [makeItem()] })
        expect(
            screen.getByRole('grid', { name: 'Notifications' }),
        ).toBeInTheDocument()
    })

    it('calls onMarkAllAsRead when the Mark all as read button is clicked', async () => {
        const user = userEvent.setup()
        const onMarkAllAsRead = vi.fn()
        renderPanel({ onMarkAllAsRead })

        await user.click(
            screen.getByRole('button', { name: 'Mark all as read' }),
        )

        expect(onMarkAllAsRead).toHaveBeenCalledTimes(1)
    })

    it('renders the close button when onClose is provided and calls it on click', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        renderPanel({ onClose })

        await user.click(screen.getByRole('button', { name: 'Close' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not render the close button when onClose is not provided', () => {
        renderPanel()
        expect(
            screen.queryByRole('button', { name: 'Close' }),
        ).not.toBeInTheDocument()
    })
})
