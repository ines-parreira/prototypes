import { SidebarProvider } from '@repo/navigation'
import { history } from '@repo/routing'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { StatsNavbarSection } from 'routes/layout/products/analytics'

import { CollapsedAnalyticsSidebar } from '../CollapsedAnalyticsSidebar'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('CollapsedAnalyticsSidebar', () => {
    const mockSections: StatsNavbarSection[] = [
        {
            id: 'live',
            label: 'Live',
            icon: 'ai',
            items: [
                {
                    id: 'overview',
                    route: 'live-overview',
                    label: 'Overview',
                },
                {
                    id: 'agents',
                    route: 'live-agents',
                    label: 'Agents',
                },
            ],
        },
        {
            id: 'support-performance',
            label: 'Support Performance',
            icon: 'alarm',
            items: [
                {
                    id: 'overview',
                    route: 'support-performance/overview',
                    label: 'Overview',
                },
                {
                    id: 'agents',
                    route: 'support-performance/agents',
                    label: 'Agents',
                },
            ],
        },
        {
            id: 'ticket-insights',
            label: 'Ticket Insights',
            icon: 'bookmark',
            items: [
                {
                    id: 'ticket-fields',
                    route: 'ticket-insights/ticket-fields',
                    label: 'Ticket Fields',
                },
            ],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all sections', () => {
        render(<CollapsedAnalyticsSidebar sections={mockSections} />, {
            wrapper: SidebarProvider,
        })

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockSections.length)
    })

    it('navigates to first item route when clicking a section', async () => {
        const user = userEvent.setup()
        render(<CollapsedAnalyticsSidebar sections={mockSections} />, {
            wrapper: SidebarProvider,
        })

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[0]))

        expect(history.push).toHaveBeenCalledWith('/app/stats/live-overview')
    })

    it('navigates to correct first item for different sections', async () => {
        const user = userEvent.setup()
        render(<CollapsedAnalyticsSidebar sections={mockSections} />, {
            wrapper: SidebarProvider,
        })

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[1])

        expect(history.push).toHaveBeenCalledWith(
            '/app/stats/support-performance/overview',
        )
    })

    it('handles section without items', async () => {
        const user = userEvent.setup()
        const sectionsWithoutItems = [
            {
                id: 'empty',
                label: 'Empty Section',
                icon: 'folder' as const,
                items: [],
            },
        ]

        render(<CollapsedAnalyticsSidebar sections={sectionsWithoutItems} />, {
            wrapper: SidebarProvider,
        })

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[0]))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('handles section with undefined items', async () => {
        const user = userEvent.setup()
        const sectionsWithUndefinedItems = [
            {
                id: 'undefined-items',
                label: 'No Items',
                icon: 'folder' as const,
            },
        ]

        render(
            <CollapsedAnalyticsSidebar sections={sectionsWithUndefinedItems} />,
            { wrapper: SidebarProvider },
        )

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[0]))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('navigates to a specific item when clicking a menu item', async () => {
        const user = userEvent.setup()
        render(<CollapsedAnalyticsSidebar sections={mockSections} />, {
            wrapper: SidebarProvider,
        })

        await act(() => user.click(screen.getAllByRole('radio')[0]))
        jest.clearAllMocks()
        await act(() =>
            user.click(screen.getByRole('menuitemradio', { name: 'Agents' })),
        )

        expect(history.push).toHaveBeenCalledWith('/app/stats/live-agents')
    })

    it('renders trailingSlot content for items in the dropdown menu', async () => {
        const user = userEvent.setup()
        const sectionsWithTrailingSlot: StatsNavbarSection[] = [
            {
                id: 'automate',
                label: 'AI & automation',
                icon: 'zap' as const,
                items: [
                    {
                        id: 'analytics-overview',
                        route: 'analytics/overview',
                        label: 'Overview',
                        trailingSlot: <span>Beta</span>,
                    },
                    {
                        id: 'analytics-ai-agent',
                        route: 'analytics/ai-agent',
                        label: 'AI Agent',
                        trailingSlot: <span>New</span>,
                    },
                ],
            },
        ]

        render(
            <CollapsedAnalyticsSidebar sections={sectionsWithTrailingSlot} />,
            { wrapper: SidebarProvider },
        )

        await act(() => user.click(screen.getByRole('radio')))

        expect(screen.getByText('Beta')).toBeInTheDocument()
        expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders upgrade icon for items with requiresUpgrade in the dropdown menu', async () => {
        const user = userEvent.setup()
        const sectionsWithUpgrade: StatsNavbarSection[] = [
            {
                id: 'voice',
                label: 'Voice',
                icon: 'soundwave' as const,
                items: [
                    {
                        id: 'voice-overview',
                        route: 'voice/overview',
                        label: 'Overview',
                        requiresUpgrade: true,
                    },
                    {
                        id: 'voice-agents',
                        route: 'voice/agents',
                        label: 'Agents',
                    },
                ],
            },
        ]

        render(<CollapsedAnalyticsSidebar sections={sectionsWithUpgrade} />, {
            wrapper: SidebarProvider,
        })

        await act(() => user.click(screen.getByRole('radio')))

        const menuItems = screen.getAllByRole('menuitemradio')
        expect(menuItems[0].querySelector('svg')).toBeInTheDocument()
        expect(menuItems[1].querySelector('svg')).not.toBeInTheDocument()
    })

    it('navigates directly when clicking a single-item section without opening a menu', async () => {
        const user = userEvent.setup()
        render(<CollapsedAnalyticsSidebar sections={mockSections} />, {
            wrapper: SidebarProvider,
        })

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[2]))

        expect(history.push).toHaveBeenCalledWith(
            '/app/stats/ticket-insights/ticket-fields',
        )
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
})
