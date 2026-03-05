import { history } from '@repo/routing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SettingsNavbarSection } from 'routes/layout/sidebars/SettingsSidebar/useSettingsNavigation'
import { renderWithRouter } from 'utils/testing'

import { CollapsedSettingsSidebar } from '../CollapsedSettingsSidebar'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('CollapsedSettingsSidebar', () => {
    const mockSections: SettingsNavbarSection[] = [
        {
            id: 'account',
            label: 'Account',
            icon: 'user',
            items: [
                {
                    key: 'profile',
                    to: 'account/profile',
                    text: 'Profile',
                },
                {
                    key: 'preferences',
                    to: 'account/preferences',
                    text: 'Preferences',
                },
            ],
        },
        {
            id: 'company',
            label: 'Company',
            icon: 'chart-line',
            items: [
                {
                    key: 'details',
                    to: 'company/details',
                    text: 'Company Details',
                },
                {
                    key: 'billing',
                    to: 'company/billing',
                    text: 'Billing',
                },
            ],
        },
        {
            id: 'integrations',
            label: 'Integrations',
            icon: 'calendar',
            items: [
                {
                    key: 'all',
                    to: 'integrations',
                    text: 'All Integrations',
                },
            ],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all sections', () => {
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        expect(buttons).toHaveLength(mockSections.length)
    })

    it('navigates to first item route when clicking a section', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

        expect(history.push).toHaveBeenCalledWith(
            '/app/settings/account/profile',
        )
    })

    it('navigates to correct first item for different sections', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />)

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[1])

        expect(history.push).toHaveBeenCalledWith(
            '/app/settings/company/details',
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
            <CollapsedSettingsSidebar sections={sectionsWithoutItems} />,
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
            <CollapsedSettingsSidebar
                sections={sectionsWithUndefinedItems as any}
            />,
        )

        const buttons = screen.getAllByRole('radio')
        await user.click(buttons[0])

        expect(history.push).not.toHaveBeenCalled()
    })
})
