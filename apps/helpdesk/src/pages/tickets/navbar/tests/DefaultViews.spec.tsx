import { assumeMock, render } from '@repo/testing'
import {
    DefaultViewsMenu,
    SYSTEM_VIEW_DEFINITIONS,
    useExpandableDefaultViews,
} from '@repo/tickets'
import { useCurrentUserRole } from '@repo/users'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { activeViewIdSet } from 'state/ui/views/actions'

import { DefaultViews } from '../DefaultViews'
import { TicketNavbarViewLinkItem } from '../TicketNavbarViewLinkItem'

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useIsMobileResolution: jest.fn(() => false),
}))

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    DefaultViewsMenu: jest.fn(),
    useExpandableDefaultViews: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/ui/views/actions', () => ({ activeViewIdSet: jest.fn() }))
const activeViewIdSetMock = assumeMock(activeViewIdSet)

const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)
const mockUseIsMobileResolution = useIsMobileResolution as jest.MockedFunction<
    typeof useIsMobileResolution
>

jest.mock('../TicketNavbarViewLinkItem', () => ({
    TicketNavbarViewLinkItem: jest.fn(),
}))
const MockTicketNavbarViewLinkItem = assumeMock(TicketNavbarViewLinkItem)

const mockUseExpandableDefaultViews = assumeMock(useExpandableDefaultViews)
const MockDefaultViewsMenu = assumeMock(DefaultViewsMenu)
type ExpandableDefaultViewsContext = ReturnType<
    typeof useExpandableDefaultViews
>

const inboxView = {
    id: 1,
    name: 'Inbox',
    slug: 'inbox',
    uri: '/api/views/1',
    category: 'system' as const,
}

const unassignedView = {
    id: 2,
    name: 'Unassigned',
    slug: 'unassigned',
    uri: '/api/views/2',
    category: 'system' as const,
}

const allView = {
    id: 3,
    name: 'All',
    slug: 'all',
    uri: '/api/views/3',
    category: 'system' as const,
}

const renderComponent = () =>
    render(<DefaultViews />, {
        initialEntries: ['/app/tickets/1/inbox'],
        path: '/app/tickets/:viewId?/:slug?',
    })

describe('DefaultViews', () => {
    const toggleExpanded = jest.fn()
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        MockDefaultViewsMenu.mockReturnValue(<div>DefaultViewsMenu</div>)
        MockTicketNavbarViewLinkItem.mockImplementation(
            ({ label, onClick }: { label?: string; onClick?: () => void }) => (
                <div onClick={onClick}>{label}</div>
            ),
        )
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn(),
            currentUser: { id: 1, role: { name: 'viewer' } },
        })
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [inboxView, unassignedView],
            showToggle: false,
            isExpanded: false,
            toggleExpanded,
        } as ExpandableDefaultViewsContext)
        mockUseIsMobileResolution.mockReturnValue(false)
    })

    it('should render the "Default views" heading', () => {
        renderComponent()

        expect(screen.getByText('Default views')).toBeInTheDocument()
    })

    it('should render the DefaultViewsMenu for admin users', () => {
        renderComponent()

        expect(screen.getByText('DefaultViewsMenu')).toBeInTheDocument()
    })

    it('should not render the DefaultViewsMenu for non-admin users', () => {
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: false,
            hasRole: jest.fn(),
            currentUser: { id: 1, role: { name: 'viewer' } },
        })

        renderComponent()

        expect(screen.queryByText('DefaultViewsMenu')).not.toBeInTheDocument()
    })

    it('should render view labels for displayed views', () => {
        renderComponent()

        expect(
            screen.getByText(SYSTEM_VIEW_DEFINITIONS['Inbox'].label),
        ).toBeInTheDocument()
        expect(
            screen.getByText(SYSTEM_VIEW_DEFINITIONS['Unassigned'].label),
        ).toBeInTheDocument()
    })

    it('should not render the toggle button when showToggle is false', () => {
        renderComponent()

        expect(
            screen.queryByRole('button', { name: /more/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /less/i }),
        ).not.toBeInTheDocument()
    })

    it('should render "More" button when showToggle is true and collapsed', () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [inboxView, unassignedView, allView],
            showToggle: true,
            isExpanded: false,
            toggleExpanded,
        } as ExpandableDefaultViewsContext)

        renderComponent()

        expect(
            screen.getByRole('button', { name: /more/i }),
        ).toBeInTheDocument()
    })

    it('should render "Less" button when showToggle is true and expanded', () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [inboxView, unassignedView, allView],
            showToggle: true,
            isExpanded: true,
            toggleExpanded,
        } as ExpandableDefaultViewsContext)

        renderComponent()

        expect(
            screen.getByRole('button', { name: /less/i }),
        ).toBeInTheDocument()
    })

    it('should call toggleExpanded when the toggle button is clicked', async () => {
        const user = userEvent.setup()
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [inboxView, unassignedView, allView],
            showToggle: true,
            isExpanded: false,
            toggleExpanded,
        } as ExpandableDefaultViewsContext)

        renderComponent()

        await user.click(screen.getByRole('button', { name: /more/i }))

        expect(toggleExpanded).toHaveBeenCalledTimes(1)
    })

    it('should dispatch activeViewIdSet with the view id when a view is clicked', async () => {
        const user = userEvent.setup()
        activeViewIdSetMock.mockReturnValue({
            type: 'active-view-id-set',
            payload: inboxView.id,
        })

        renderComponent()

        await user.click(
            screen.getByText(SYSTEM_VIEW_DEFINITIONS['Inbox'].label),
        )

        expect(activeViewIdSetMock).toHaveBeenCalledWith(inboxView.id)
        expect(dispatch).toHaveBeenCalledWith({
            type: 'active-view-id-set',
            payload: inboxView.id,
        })
    })

    it('should pass additionalActivePaths from SYSTEM_VIEW_DEFINITIONS to the Inbox view item', () => {
        renderComponent()

        expect(MockTicketNavbarViewLinkItem).toHaveBeenCalledWith(
            expect.objectContaining({
                additionalActivePaths:
                    SYSTEM_VIEW_DEFINITIONS['Inbox'].additionalPaths,
            }),
            expect.anything(),
        )
    })

    it('should not render views with missing id or name', () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [
                { ...inboxView, id: undefined as unknown as number },
                { ...unassignedView, name: undefined as unknown as string },
                allView,
            ],
            showToggle: false,
            isExpanded: false,
            toggleExpanded,
        } as ExpandableDefaultViewsContext)

        renderComponent()

        expect(
            screen.queryByText(SYSTEM_VIEW_DEFINITIONS['Inbox'].label),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(SYSTEM_VIEW_DEFINITIONS['Unassigned'].label),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(SYSTEM_VIEW_DEFINITIONS['All'].label),
        ).toBeInTheDocument()
    })

    it('should render correctly on mobile resolution', () => {
        mockUseIsMobileResolution.mockReturnValue(true)

        renderComponent()

        expect(screen.getByText('Default views')).toBeInTheDocument()
    })
})
