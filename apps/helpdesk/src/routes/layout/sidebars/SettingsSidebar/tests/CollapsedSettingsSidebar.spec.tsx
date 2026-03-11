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
                    id: 'profile',
                    to: 'account/profile',
                    text: 'Profile',
                },
                {
                    id: 'preferences',
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
                    id: 'details',
                    to: 'company/details',
                    text: 'Company Details',
                },
                {
                    id: 'billing',
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
                    id: 'all',
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

    it('marks the active section as selected when URL matches a section item', () => {
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />, {
            route: '/app/settings/account/profile',
        })

        const buttons = screen.getAllByRole('radio')
        expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
        expect(buttons[1]).not.toHaveAttribute('aria-checked', 'true')
    })

    it('renders all section items as menu items', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />)

        await user.click(screen.getAllByRole('radio')[0])

        expect(
            screen.getByRole('menuitemradio', { name: 'Profile' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitemradio', { name: 'Preferences' }),
        ).toBeInTheDocument()
    })

    it('navigates to a specific item when clicking a menu item', async () => {
        const user = userEvent.setup()
        renderWithRouter(<CollapsedSettingsSidebar sections={mockSections} />)

        await user.click(screen.getAllByRole('radio')[0])
        jest.clearAllMocks()
        await user.click(
            screen.getByRole('menuitemradio', { name: 'Preferences' }),
        )

        expect(history.push).toHaveBeenCalledWith(
            '/app/settings/account/preferences',
        )
    })

    it('calls item onClick when a menu item is clicked', async () => {
        const user = userEvent.setup()
        const onClickMock = jest.fn()
        const sectionsWithOnClick: SettingsNavbarSection[] = [
            {
                id: 'account',
                label: 'Account',
                icon: 'user',
                items: [
                    {
                        id: 'profile',
                        to: 'account/profile',
                        text: 'Profile',
                        onClick: onClickMock,
                    },
                ],
            },
        ]

        renderWithRouter(
            <CollapsedSettingsSidebar sections={sectionsWithOnClick} />,
        )

        await user.click(screen.getAllByRole('radio')[0])
        jest.clearAllMocks()
        await user.click(screen.getByRole('menuitemradio', { name: 'Profile' }))

        expect(onClickMock).toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith(
            '/app/settings/account/profile',
        )
    })
})
