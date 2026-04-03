import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Settings } from './Settings'

// Polyfill for jsdom missing Web Animations API used by react-aria-components
if (typeof Element.prototype.getAnimations === 'undefined') {
    Element.prototype.getAnimations = function () {
        return []
    }
}

describe('<Settings />', () => {
    it('should render the Settings heading', () => {
        render(<Settings />)

        expect(
            screen.getByRole('heading', { name: 'Settings' }),
        ).toBeInTheDocument()
    })

    describe('tabs', () => {
        it('should render 3 tabs', () => {
            render(<Settings />)

            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toBeInTheDocument()
        })

        it('should select Sender Identity tab by default', () => {
            render(<Settings />)

            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toHaveAttribute('aria-selected', 'false')
            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should select Compliance tab when clicked', async () => {
            const user = userEvent.setup()
            render(<Settings />)

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Compliance' }),
                )
            })

            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should select Integrations tab when clicked', async () => {
            const user = userEvent.setup()
            render(<Settings />)

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Integrations' }),
                )
            })

            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toHaveAttribute('aria-selected', 'true')
        })
    })
})
