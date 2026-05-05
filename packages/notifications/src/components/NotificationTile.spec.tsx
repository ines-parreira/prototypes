import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NotificationTile } from './NotificationTile'

const baseProps = {
    id: 'notif-1',
    icon: 'comm-bell' as const,
    title: 'New message',
    createdDatetime: '2024-01-01T11:59:00Z',
    readDatetime: null as string | null,
}

const renderTile = (
    props: Partial<typeof baseProps> & {
        href?: string
        onClick?: () => void
        onMarkAsUnread?: () => void
        children?: React.ReactNode
    } = {},
) => render(<NotificationTile {...baseProps} {...props} />)

describe('NotificationTile', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders the title', () => {
        renderTile()
        expect(screen.getByText('New message')).toBeInTheDocument()
    })

    it('renders children content', () => {
        renderTile({ children: 'Ticket excerpt here' })
        expect(screen.getByText('Ticket excerpt here')).toBeInTheDocument()
    })

    describe('unread state', () => {
        it('shows relative time when readDatetime is null', () => {
            renderTile({ readDatetime: null })
            expect(screen.getByText('1m ago')).toBeInTheDocument()
        })

        it('does not show Read button when unread', () => {
            renderTile({ readDatetime: null })
            expect(screen.queryByText('Read')).not.toBeInTheDocument()
        })
    })

    describe('read state', () => {
        it('shows Read status button when readDatetime is set', () => {
            renderTile({ readDatetime: '2024-01-01T12:00:00Z' })
            expect(screen.getByText('Read')).toBeInTheDocument()
        })

        it('does not show relative time tag when read', () => {
            renderTile({ readDatetime: '2024-01-01T12:00:00Z' })
            expect(screen.queryByText('1m ago')).not.toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('renders as a link when `href` is provided', () => {
            renderTile({ href: '/app/ticket/1' })
            expect(screen.getByRole('link')).toBeInTheDocument()
        })

        it('renders as a link when `href` is not provided', () => {
            renderTile()
            expect(screen.getByRole('link')).toBeInTheDocument()
        })
    })

    it('calls onClick when the tile is clicked', async () => {
        const user = userEvent.setup({
            advanceTimers: vi.advanceTimersByTime.bind(vi),
        })
        const onClick = vi.fn()
        renderTile({ onClick })
        await user.click(screen.getByRole('link'))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
