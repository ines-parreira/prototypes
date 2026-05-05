import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NotificationsPanel } from './NotificationsPanel'
import type { NotificationsPanelProps } from './NotificationsPanel'
import { NotificationTile } from './NotificationTile'

const baseItem = {
    id: 'notif-1',
    icon: 'comm-bell' as const,
    title: 'Test notification',
    createdDatetime: '2024-01-01T12:00:00Z',
    readDatetime: null as string | null,
    notification: {
        id: 'notif-1',
        inserted_datetime: '2024-01-01T12:00:00Z',
        read_datetime: null,
        seen_datetime: null,
        type: 'test',
        payload: {},
    },
}

const defaultProps: NotificationsPanelProps = {
    title: 'Notifications',
    toolbar: null,
    items: [baseItem],
    onMarkAllAsRead: vi.fn(),
    children: (item) => (
        <NotificationTile
            id={item.id}
            icon={item.icon}
            title={item.title}
            createdDatetime={item.createdDatetime}
            readDatetime={item.readDatetime}
        />
    ),
}

const renderPanel = (props: Partial<NotificationsPanelProps> = {}) =>
    render(<NotificationsPanel {...defaultProps} {...props} />)

describe('NotificationsPanel', () => {
    it('renders the panel title', () => {
        renderPanel()
        expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('renders the Mark all as read button', () => {
        renderPanel()
        expect(
            screen.getByRole('button', { name: /mark all as read/i }),
        ).toBeInTheDocument()
    })

    it('calls onMarkAllAsRead when the button is clicked', async () => {
        const user = userEvent.setup()
        const onMarkAllAsRead = vi.fn()
        renderPanel({ onMarkAllAsRead })
        await user.click(
            screen.getByRole('button', { name: /mark all as read/i }),
        )
        expect(onMarkAllAsRead).toHaveBeenCalledTimes(1)
    })

    it('renders the close button when onClose is provided', () => {
        renderPanel({ onClose: vi.fn() })
        expect(
            screen.getByRole('button', { name: /close/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        renderPanel({ onClose })
        await user.click(screen.getByRole('button', { name: /close/i }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders notification items via children render function', () => {
        renderPanel()
        expect(screen.getByText('Test notification')).toBeInTheDocument()
    })

    it('renders the empty state when items is empty', () => {
        renderPanel({ items: [] })
        expect(screen.getByText('No notifications')).toBeInTheDocument()
    })

    it('renders the toolbar slot', () => {
        renderPanel({ toolbar: <span>Filter</span> })
        expect(screen.getByText('Filter')).toBeInTheDocument()
    })
})
