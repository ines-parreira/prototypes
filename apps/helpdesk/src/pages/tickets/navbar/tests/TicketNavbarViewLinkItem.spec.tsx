import { assumeMock } from '@repo/testing'
import { setViewsCount } from '@repo/views'
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
    label = 'Assigned to me',
}: {
    view?: Pick<View, 'id' | 'name' | 'slug' | 'decoration'>
    label?: string
} = {}) =>
    renderWithRouter(
        <TicketNavbarViewLinkItem
            icon="user-arrow"
            view={view}
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
        setViewsCount({ [defaultView.id]: 7 })
        renderComponent()

        expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('should not render view count when viewCount is 0', () => {
        setViewsCount({ [defaultView.id]: 0 })
        renderComponent()

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
            decoration: {},
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

        setViewsCount({ [deactivatedView.id]: 10 })
        renderComponent({ view: deactivatedView })

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

    it('should be active when the current path matches an additionalActivePath', () => {
        renderWithRouter(
            <TicketNavbarViewLinkItem
                icon="user-arrow"
                view={{ ...defaultView, id: 999 }}
                label="Assigned to me"
                additionalActivePaths={['/app/views']}
            />,
            {
                route: '/app/views',
                path: '/app/views',
            },
        )

        expect(screen.getByRole('link')).toHaveClass('active')
    })

    it('should be active when the current path is /app and it is in additionalActivePaths', () => {
        renderWithRouter(
            <TicketNavbarViewLinkItem
                icon="user-arrow"
                view={{ ...defaultView, id: 999 }}
                label="Assigned to me"
                additionalActivePaths={['/app/views', '/app']}
            />,
            {
                route: '/app',
                path: '/app',
            },
        )

        expect(screen.getByRole('link')).toHaveClass('active')
    })

    it('should not be active when additionalActivePaths does not match the current path', () => {
        renderWithRouter(
            <TicketNavbarViewLinkItem
                icon="user-arrow"
                view={{ ...defaultView, id: 999 }}
                label="Assigned to me"
                additionalActivePaths={['/app/views']}
            />,
            {
                route: '/app/other',
                path: '/app/other',
            },
        )

        expect(screen.getByRole('link')).not.toHaveClass('active')
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
