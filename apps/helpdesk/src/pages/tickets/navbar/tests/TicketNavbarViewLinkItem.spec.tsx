import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { View } from '@gorgias/helpdesk-types'

import { useSplitTicketView } from 'split-ticket-view-toggle'
import { renderWithRouter } from 'utils/testing'

import { TicketNavbarViewLinkItem } from '../TicketNavbarViewLinkItem'

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: jest.fn(),
}))
const useSplitTicketViewMock = assumeMock(useSplitTicketView)
type SplitTicketViewContext = ReturnType<typeof useSplitTicketView>

const defaultView: Pick<
    View,
    'id' | 'name' | 'slug' | 'decoration' | 'deactivated_datetime'
> = {
    id: 123,
    name: 'Inbox',
    slug: 'inbox',
    decoration: undefined,
    deactivated_datetime: undefined,
}

const renderComponent = ({
    view = defaultView,
    viewCount,
    label = 'Assigned to me',
}: {
    view?: Pick<View, 'id' | 'name' | 'slug' | 'decoration'>
    viewCount?: number
    label?: string
} = {}) =>
    renderWithRouter(
        <TicketNavbarViewLinkItem
            icon="user-arrow"
            view={view}
            viewCount={viewCount}
            label={label}
        />,
        {
            route: '/app/tickets/123/inbox',
            path: '/app/tickets/:viewId?/:slug?',
        },
    )

describe('TicketNavbarViewLinkItem', () => {
    beforeEach(() => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
        } as SplitTicketViewContext)
    })

    it('should render the view label', () => {
        renderComponent()

        expect(screen.getByText('Assigned to me')).toBeInTheDocument()
    })

    it('should render the view name when no label is provided', () => {
        renderWithRouter(
            <TicketNavbarViewLinkItem icon="inbox" view={defaultView} />,
            {
                route: '/app/tickets/123/inbox',
                path: '/app/tickets/:viewId?/:slug?',
            },
        )

        expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    it('should render a link to the ticket view URL', () => {
        renderComponent()

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/app/tickets/123/inbox')
    })

    it('should render a split ticket view link when split view is enabled', () => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
        } as SplitTicketViewContext)

        renderComponent()

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/app/views/123')
    })

    it('should render the view count when provided', () => {
        renderComponent({ viewCount: 7 })

        expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('should not render view count when viewCount is 0', () => {
        renderComponent({ viewCount: 0 })

        expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should encode slug with special characters in the URL', () => {
        const viewWithSpecialSlug: typeof defaultView = {
            ...defaultView,
            slug: 'my/special-view',
        }

        renderComponent({ view: viewWithSpecialSlug })

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute(
            'href',
            '/app/tickets/123/my%2Fspecial-view',
        )
    })

    it('should render deactivated error icon when view has deactivated_datetime', () => {
        const deactivatedView = {
            ...defaultView,
            deactivated_datetime: '2023-01-01T00:00:00Z',
        }

        renderComponent({ view: deactivatedView })

        expect(
            screen.getByRole('img', { name: 'octagon-error' }),
        ).toBeInTheDocument()
    })

    it('should not render view count when view has deactivated_datetime', () => {
        const deactivatedView = {
            ...defaultView,
            deactivated_datetime: '2023-01-01T00:00:00Z',
        }

        renderComponent({ view: deactivatedView, viewCount: 10 })

        expect(screen.queryByText('10')).not.toBeInTheDocument()
    })

    it('should render emoji decoration in label', () => {
        const viewWithEmoji = {
            ...defaultView,
            decoration: { emoji: '🚀' },
        }

        renderComponent({ view: viewWithEmoji })

        expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('should call onClick when the link is clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()

        renderWithRouter(
            <TicketNavbarViewLinkItem view={defaultView} onClick={onClick} />,
            {
                route: '/app/tickets/123/inbox',
                path: '/app/tickets/:viewId?/:slug?',
            },
        )

        await user.click(screen.getByRole('link'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should pass canduId as data-candu-id attribute on the link', () => {
        const { container } = renderWithRouter(
            <TicketNavbarViewLinkItem
                view={defaultView}
                canduId="test-candu-id"
            />,
            {
                route: '/app/tickets/123/inbox',
                path: '/app/tickets/:viewId?/:slug?',
            },
        )

        expect(
            container.querySelector('[data-candu-id="test-candu-id"]'),
        ).toBeInTheDocument()
    })
})
