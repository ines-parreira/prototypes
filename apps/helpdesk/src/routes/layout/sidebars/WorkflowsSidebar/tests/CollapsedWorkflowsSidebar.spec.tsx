import { history } from '@repo/routing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { WorkflowsNavbarSection } from 'routes/layout/sidebars/WorkflowsSidebar/useWorkflowsNavigation'
import { renderWithRouter } from 'utils/testing'

import { CollapsedWorkflowsSidebar } from '../CollapsedWorkflowsSidebar'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('CollapsedWorkflowsSidebar', () => {
    const mockSections: WorkflowsNavbarSection[] = [
        {
            id: 'rules',
            label: 'Rules',
            icon: 'flows',
            items: [
                {
                    id: 'all',
                    path: 'rules',
                    label: 'All Rules',
                },
                {
                    id: 'new',
                    path: 'rules/new',
                    label: 'New Rule',
                },
            ],
        },
        {
            id: 'macros',
            label: 'Macros',
            icon: 'chart-line',
            items: [
                {
                    id: 'all',
                    path: 'macros',
                    label: 'All Macros',
                },
                {
                    id: 'new',
                    path: 'macros/new',
                    label: 'New Macro',
                },
            ],
        },
        {
            id: 'tags',
            label: 'Tags',
            icon: 'tag',
            items: [
                {
                    id: 'all',
                    path: 'tags',
                    label: 'All Tags',
                },
            ],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all sections', () => {
        renderWithRouter(<CollapsedWorkflowsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockSections.length)
    })

    it('navigates to first item path when clicking a section', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedWorkflowsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

        expect(history.push).toHaveBeenCalledWith('/app/workflows/rules')
    })

    it('navigates to correct first item for different sections', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedWorkflowsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[1])

        expect(history.push).toHaveBeenCalledWith('/app/workflows/macros')
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
            <CollapsedWorkflowsSidebar sections={sectionsWithoutItems} />,
        )

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

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
            <CollapsedWorkflowsSidebar
                sections={sectionsWithUndefinedItems as any}
            />,
        )

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

        expect(history.push).not.toHaveBeenCalled()
    })

    it('marks the active section as selected when URL matches a section item', () => {
        renderWithRouter(
            <CollapsedWorkflowsSidebar sections={mockSections} />,
            {
                route: '/app/workflows/rules',
            },
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
        expect(buttons[1]).not.toHaveAttribute('aria-checked', 'true')
    })

    it('renders all section items as menu items', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedWorkflowsSidebar sections={mockSections} />)

        await user.click(screen.getAllByRole('radio')[0])

        expect(
            screen.getByRole('menuitemradio', { name: 'All Rules' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitemradio', { name: 'New Rule' }),
        ).toBeInTheDocument()
    })

    it('navigates to a specific item when clicking a menu item', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedWorkflowsSidebar sections={mockSections} />)

        await user.click(screen.getAllByRole('radio')[0])
        jest.clearAllMocks()
        await user.click(
            screen.getByRole('menuitemradio', { name: 'New Rule' }),
        )

        expect(history.push).toHaveBeenCalledWith('/app/workflows/rules/new')
    })
})
