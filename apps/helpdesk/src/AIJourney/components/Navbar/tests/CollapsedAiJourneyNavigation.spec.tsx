import { history } from '@repo/routing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { CollapsedAiJourneyNavigation } from '../CollapsedAiJourneyNavigation'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('CollapsedAiJourneyNavigation', () => {
    const mockNavigationItems = [
        {
            icon: 'dashboard',
            to: '/app/ai-journey/overview',
            label: 'Overview',
            exact: true,
        },
        {
            icon: 'chart-line',
            to: '/app/ai-journey/conversations',
            label: 'Conversations',
        },
        {
            icon: 'settings',
            to: '/app/ai-journey/settings',
            label: 'Settings',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all navigation items', () => {
        renderWithRouter(
            <CollapsedAiJourneyNavigation
                navigationItems={mockNavigationItems}
            />,
        )

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockNavigationItems.length)
    })

    it('navigates to correct route when clicking an item', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <CollapsedAiJourneyNavigation
                navigationItems={mockNavigationItems}
            />,
        )

        await user.click(screen.getByRole('img', { name: 'chart-line' }))

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-journey/conversations',
        )
    })
})
