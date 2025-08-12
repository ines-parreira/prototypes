import { render, screen } from '@testing-library/react'
import userEventLib from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { ActionDrivenNavigationItems } from '../ActionDrivenNavigationItems'

const mockNavigationItems: NavigationItem[] = [
    {
        route: '/app/ai-agent/shopify/test-store/overview',
        title: 'Overview',
        exact: true,
        dataCanduId: 'overview',
    },
    {
        route: '',
        title: 'Analyze',
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
        title: 'Deploy',
        items: [
            {
                route: '/app/ai-agent/shopify/test-store/deploy/chat',
                title: 'Chat',
                exact: true,
            },
            {
                route: '/app/ai-agent/shopify/test-store/deploy/email',
                title: 'Email',
                exact: true,
            },
        ],
    },
    {
        route: '/app/ai-agent/shopify/test-store/chat',
        title: 'Chat',
    },
    {
        route: '/app/ai-agent/shopify/test-store/email',
        title: 'Email',
    },
]

describe('ActionDrivenNavigationItems', () => {
    const mockGetChannelStatus = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetChannelStatus.mockReturnValue(false)
    })

    const renderComponent = (
        props: Partial<Parameters<typeof ActionDrivenNavigationItems>[0]> = {},
    ) => {
        return render(
            <MemoryRouter>
                <Navigation.Root value={['analyze', 'deploy']}>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                        {...props}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )
    }

    it('renders null when selectedStore is not provided', () => {
        const { container } = render(
            <MemoryRouter>
                <Navigation.Root>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore={undefined}
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        expect(
            container.querySelector('[role="button"]'),
        ).not.toBeInTheDocument()
        expect(container.querySelector('[role="link"]')).not.toBeInTheDocument()
    })

    it('renders null when navigationItems is not provided', () => {
        const { container } = render(
            <MemoryRouter>
                <Navigation.Root>
                    <ActionDrivenNavigationItems
                        navigationItems={undefined as any}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        expect(
            container.querySelector('[role="button"]'),
        ).not.toBeInTheDocument()
        expect(container.querySelector('[role="link"]')).not.toBeInTheDocument()
    })

    it('renders navigation items without nested items', () => {
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        const overviewLink = screen.getByRole('link', { name: 'Overview' })
        expect(overviewLink).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/overview',
        )
    })

    it('renders navigation sections with nested items', async () => {
        renderComponent()

        const analyzeButton = screen.getByRole('button', { name: /Analyze/ })
        expect(analyzeButton).toBeInTheDocument()

        expect(screen.getByText('Analytics')).toBeInTheDocument()
        expect(screen.getByText('Opportunities')).toBeInTheDocument()
    })

    it('renders status indicator for Chat channel when active', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')
        renderComponent()

        const chatElements = screen.getAllByText('Chat')
        expect(chatElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)
    })

    it('renders status indicator for Email channel when active', () => {
        mockGetChannelStatus.mockImplementation(
            (channel) => channel === 'email',
        )
        renderComponent()

        const emailElements = screen.getAllByText('Email')
        expect(emailElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)
    })

    it('calls getChannelStatus with correct channel type for Chat', () => {
        renderComponent()

        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
    })

    it('calls getChannelStatus with correct channel type for Email', () => {
        renderComponent()

        expect(mockGetChannelStatus).toHaveBeenCalledWith('email')
        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
    })

    it('renders status indicator with correct src for active channel', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')
        renderComponent()

        const statusIcons = screen.getAllByAltText('status icon')
        const chatStatusIcon = statusIcons.find((icon) => {
            const parent = icon.parentElement
            return parent?.textContent?.includes('Chat')
        })

        expect(chatStatusIcon).toHaveAttribute('src', 'test-file-stub')
    })

    it('renders status indicator with correct src for inactive channel', () => {
        mockGetChannelStatus.mockReturnValue(false)
        renderComponent()

        const statusIcons = screen.getAllByAltText('status icon')
        const firstStatusIcon = statusIcons[0]

        expect(firstStatusIcon).toHaveAttribute('src', 'test-file-stub')
    })

    it('handles getChannelStatus not provided', () => {
        render(
            <MemoryRouter>
                <Navigation.Root value={['deploy']}>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore="test-store"
                        getChannelStatus={undefined}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        const chatElements = screen.getAllByText('Chat')
        expect(chatElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        statusIcons.forEach((icon) => {
            expect(icon).toHaveAttribute('src', 'test-file-stub')
        })
    })

    it('applies correct props to navigation section items', () => {
        renderComponent()

        const overviewItem = screen.getByRole('link', { name: 'Overview' })
        expect(overviewItem).toHaveAttribute('data-candu-id', 'overview')
        expect(overviewItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/overview',
        )
    })

    it('renders nested items with proper links', () => {
        renderComponent()

        const analyticsItem = screen.getByRole('link', { name: 'Analytics' })
        expect(analyticsItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/analyze/analytics',
        )

        const opportunitiesItem = screen.getByRole('link', {
            name: 'Opportunities',
        })
        expect(opportunitiesItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/analyze/opportunities',
        )
    })

    it('allows expanding and collapsing sections', async () => {
        const user = userEventLib.setup()
        const { rerender } = render(
            <MemoryRouter>
                <Navigation.Root value={[]}>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        const analyzeButton = screen.getByRole('button', { name: /Analyze/ })
        expect(analyzeButton).toHaveAttribute('aria-expanded', 'false')

        await user.click(analyzeButton)

        rerender(
            <MemoryRouter>
                <Navigation.Root value={['analyze']}>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        expect(analyzeButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('handles empty navigation items array', () => {
        const { container } = render(
            <MemoryRouter>
                <Navigation.Root>
                    <ActionDrivenNavigationItems
                        navigationItems={[]}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        const links = screen.queryAllByRole('link')
        const buttons = screen.queryAllByRole('button')

        expect(links).toHaveLength(0)
        expect(buttons).toHaveLength(0)
        expect(container).toBeInTheDocument()
    })

    it('handles navigation items with only nested items', () => {
        const nestedOnlyItems: NavigationItem[] = [
            {
                route: '',
                title: 'Section',
                items: [
                    {
                        route: '/app/ai-agent/shopify/test-store/section/item1',
                        title: 'Item 1',
                    },
                    {
                        route: '/app/ai-agent/shopify/test-store/section/item2',
                        title: 'Item 2',
                    },
                ],
            },
        ]

        render(
            <MemoryRouter>
                <Navigation.Root value={['section']}>
                    <ActionDrivenNavigationItems
                        navigationItems={nestedOnlyItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        const sectionButton = screen.getByRole('button', { name: /Section/ })
        expect(sectionButton).toBeInTheDocument()
        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('handles navigation items without nested items', () => {
        const flatItems: NavigationItem[] = [
            {
                route: '/app/ai-agent/shopify/test-store/item1',
                title: 'Item 1',
            },
            {
                route: '/app/ai-agent/shopify/test-store/item2',
                title: 'Item 2',
            },
        ]

        render(
            <MemoryRouter>
                <Navigation.Root>
                    <ActionDrivenNavigationItems
                        navigationItems={flatItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()

        const buttons = screen.queryAllByRole('button')
        expect(buttons).toHaveLength(0)
    })

    it('renders status indicators correctly in both standalone and nested items', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')

        render(
            <MemoryRouter>
                <Navigation.Root value={['deploy']}>
                    <ActionDrivenNavigationItems
                        navigationItems={mockNavigationItems}
                        selectedStore="test-store"
                        getChannelStatus={mockGetChannelStatus}
                    />
                </Navigation.Root>
            </MemoryRouter>,
        )

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)

        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
        expect(mockGetChannelStatus).toHaveBeenCalledWith('email')
        expect(mockGetChannelStatus).toHaveBeenCalledTimes(2)
    })
})
