import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EngagementSettingsCardLinkButton } from '../card/EngagementSettingsCardLinkButton'

const icon = 'test-icon'

describe('EngagementSettingsCardLinkButton', () => {
    const getIcon = () => {
        return screen.queryByText(icon)
    }

    it('should correctly render the button', () => {
        render(
            <MemoryRouter>
                <EngagementSettingsCardLinkButton
                    href="/test"
                    text="Test Link"
                />
            </MemoryRouter>,
        )

        const button = screen.getByRole('button', {
            name: 'Test Link',
        })

        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('cardLinkButton')
    })

    describe('when no icon is provided', () => {
        it('should not render the icon', () => {
            render(
                <MemoryRouter>
                    <EngagementSettingsCardLinkButton
                        href="/test"
                        text="Test Link"
                    />
                </MemoryRouter>,
            )

            expect(getIcon()).not.toBeInTheDocument()
        })
    })

    describe('when an icon is provided', () => {
        it('should render the icon', () => {
            render(
                <MemoryRouter>
                    <EngagementSettingsCardLinkButton
                        href="/test"
                        icon={icon}
                        text="Test Link"
                    />
                </MemoryRouter>,
            )

            expect(getIcon()).toBeInTheDocument()
        })
    })
})
