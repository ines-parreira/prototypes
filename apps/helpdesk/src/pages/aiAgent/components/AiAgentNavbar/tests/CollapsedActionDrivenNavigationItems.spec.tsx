import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'

import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { CollapsedActionDrivenNavigationItems } from '../CollapsedActionDrivenNavigationItems'

const LocationPath = () => {
    const location = useLocation()

    return <div>{location.pathname}</div>
}

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

    it('renders all navigation items', () => {
        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={mockNavigationItems}
                />
                <LocationPath />
            </>,
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
        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={mockNavigationItems}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(
            screen.getByText('/app/ai-agent/shopify/test-store/overview'),
        ).toBeInTheDocument()
    })

    it('navigates to first nested item route when clicking an item without a direct route', async () => {
        const user = userEvent.setup()
        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={mockNavigationItems}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))

        expect(
            screen.getByText(
                '/app/ai-agent/shopify/test-store/analyze/analytics',
            ),
        ).toBeInTheDocument()
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

        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={navItemsWithEmptyNestedRoute}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'folder' }))

        expect(screen.getByText('/')).toBeInTheDocument()
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

        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={navItemsWithoutRoute}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(screen.getByText('/')).toBeInTheDocument()
    })

    it('handles empty navigation items array', () => {
        const { container } = render(
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

        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={navItemsWithBothRoutes}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'settings' }))

        expect(
            screen.getByText('/app/ai-agent/shopify/test-store/direct'),
        ).toBeInTheDocument()
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

        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={navItemsWithUndefinedItems}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))

        expect(screen.getByText('/')).toBeInTheDocument()
    })

    it('renders sub-items as menu items for items with nested items', async () => {
        const user = userEvent.setup()
        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={mockNavigationItems}
                />
                <LocationPath />
            </>,
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
        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={mockNavigationItems}
                />
                <LocationPath />
            </>,
        )

        await user.click(screen.getByRole('img', { name: 'flows' }))
        await user.click(
            screen.getByRole('menuitemradio', { name: 'Opportunities' }),
        )

        expect(
            screen.getByText(
                '/app/ai-agent/shopify/test-store/analyze/opportunities',
            ),
        ).toBeInTheDocument()
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

        render(
            <>
                <CollapsedActionDrivenNavigationItems
                    navigationItems={navItemWithoutSubItems}
                />
                <LocationPath />
            </>,
        )

        expect(screen.getAllByRole('radio')).toHaveLength(1)
        expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0)
    })

    it('marks the active section as selected when URL matches a direct route', () => {
        render(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
            { initialEntries: ['/app/ai-agent/shopify/test-store/overview'] },
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
    })

    it('marks the active section as selected when URL matches a sub-item route', () => {
        render(
            <CollapsedActionDrivenNavigationItems
                navigationItems={mockNavigationItems}
            />,
            {
                initialEntries: [
                    '/app/ai-agent/shopify/test-store/analyze/analytics',
                ],
            },
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons[1]).toHaveAttribute('aria-checked', 'true')
    })
})
