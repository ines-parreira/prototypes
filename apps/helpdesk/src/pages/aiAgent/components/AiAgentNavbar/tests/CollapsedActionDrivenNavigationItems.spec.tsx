import { history } from '@repo/routing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { renderWithRouter } from 'utils/testing'

import { CollapsedActionDrivenNavigationItems } from '../CollapsedActionDrivenNavigationItems'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('CollapsedActionDrivenNavigationItems', () => {
    const mockNavigationItems: NavigationItem[] = [
        {
            route: '/app/ai-agent/shopify/test-store/overview',
            title: 'Overview',
            icon: 'settings',
            exact: true,
        },
        {
            route: '',
            title: 'Analyze',
            icon: 'flows',
            items: [
                {
                    route: '/app/ai-agent/shopify/test-store/analyze/analytics',
                    title: 'Analytics',
                },
                {
                    route: '/app/ai-agent/shopify/test-store/analyze/opportunities',
                    title: 'Opportunities',
                },
            ],
        },
        {
            route: '',
            title: 'Train',
            icon: 'alarm',
            items: [
                {
                    route: '/app/ai-agent/shopify/test-store/train/knowledge',
                    title: 'Knowledge',
                },
            ],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all navigation items', () => {
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'settings' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'flows' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'alarm' })).toBeInTheDocument()

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockNavigationItems.length)
    })

    it('navigates to route when clicking an item with a direct route', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-store/overview',
        )
    })

    it('navigates to first nested item route when clicking an item without a direct route', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-store/analyze/analytics',
        )
    })

    it('handles item with nested items and no first item route', async () => {
        const user = userEvent.setup()
        const navItemsWithEmptyNestedRoute: NavigationItem[] = [
            {
                route: '',
                title: 'Section',
                icon: 'folder',
                items: [],
            },
        ]

        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={navItemsWithEmptyNestedRoute}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'folder' }))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('does nothing when clicking item without route and without nested items', async () => {
        const user = userEvent.setup()
        const navItemsWithoutRoute: NavigationItem[] = [
            {
                route: '',
                title: 'Empty Item',
                icon: 'settings',
            },
        ]

        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={navItemsWithoutRoute}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('handles empty navigation items array', () => {
        const { container } = renderWithRouter(
            <CollapsedActionDrivenNavigationItems navigationItems={[]} />,
        )

        const buttonGroup = container.querySelector('[role="radiogroup"]')
        expect(buttonGroup).toBeInTheDocument()

        const buttons = screen.queryAllByRole('radio')
        expect(buttons).toHaveLength(0)
    })

    it('prioritizes direct route over nested item route', async () => {
        const user = userEvent.setup()
        const navItemsWithBothRoutes: NavigationItem[] = [
            {
                route: '/app/ai-agent/shopify/test-store/direct',
                title: 'Direct Route',
                icon: 'settings',
                items: [
                    {
                        route: '/app/ai-agent/shopify/test-store/nested',
                        title: 'Nested',
                    },
                ],
            },
        ]

        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={navItemsWithBothRoutes}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-store/direct',
        )
    })

    it('handles navigation item with undefined items array', async () => {
        const user = userEvent.setup()
        const navItemsWithUndefinedItems: NavigationItem[] = [
            {
                route: '',
                title: 'No Items',
                icon: 'flows',
                items: undefined,
            },
        ]

        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={navItemsWithUndefinedItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('renders sub-items as menu items for items with nested items', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))

        expect(
            screen.getByRole('menuitemradio', { name: 'Analytics' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitemradio', { name: 'Opportunities' }),
        ).toBeInTheDocument()
    })

    it('navigates to sub-item route when clicking a menu item', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))
        jest.clearAllMocks()
        await user.click(
            screen.getByRole('menuitemradio', { name: 'Opportunities' }),
        )

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-store/analyze/opportunities',
        )
    })

    it('renders items without sub-items as bare ButtonGroupItems without a menu', () => {
        const navItemWithoutSubItems: NavigationItem[] = [
            {
                route: '/app/ai-agent/shopify/test-store/overview',
                title: 'Overview',
                icon: 'settings',
                exact: true,
            },
        ]

        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={navItemWithoutSubItems}
            />,
        )

        expect(screen.getAllByRole('radio')).toHaveLength(1)
        expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0)
    })

    it('marks the active section as selected when URL matches a direct route', () => {
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
            { route: '/app/ai-agent/shopify/test-store/overview' },
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
    })

    it('marks the active section as selected when URL matches a sub-item route', () => {
        renderWithRouter(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
            {
                route: '/app/ai-agent/shopify/test-store/analyze/analytics',
            },
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons[1]).toHaveAttribute('aria-checked', 'true')
    })
})
