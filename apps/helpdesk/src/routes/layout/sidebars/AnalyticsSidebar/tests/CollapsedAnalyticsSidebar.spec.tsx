import { history } from '@repo/routing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { StatsNavbarSection } from 'routes/layout/products/analytics'
import { renderWithRouter } from 'utils/testing'

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
        renderWithRouter(<CollapsedAnalyticsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockSections.length)
    })

    it('navigates to first item route when clicking a section', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedAnalyticsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[0]))

        expect(history.push).toHaveBeenCalledWith('/app/stats/live-overview')
    })

    it('navigates to correct first item for different sections', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedAnalyticsSidebar sections={mockSections} />)

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

        renderWithRouter(
            <CollapsedAnalyticsSidebar sections={sectionsWithoutItems} />,
        )

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

        renderWithRouter(
            <CollapsedAnalyticsSidebar sections={sectionsWithUndefinedItems} />,
        )

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[0]))

        expect(history.push).not.toHaveBeenCalled()
    })

    it('navigates to a specific item when clicking a menu item', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedAnalyticsSidebar sections={mockSections} />)

        await act(() => user.click(screen.getAllByRole('radio')[0]))
        jest.clearAllMocks()
        await act(() =>
            user.click(screen.getByRole('menuitemradio', { name: 'Agents' })),
        )

        expect(history.push).toHaveBeenCalledWith('/app/stats/live-agents')
    })

    it('navigates directly when clicking a single-item section without opening a menu', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedAnalyticsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await act(() => user.click(buttons[2]))

        expect(history.push).toHaveBeenCalledWith(
            '/app/stats/ticket-insights/ticket-fields',
        )
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
})
