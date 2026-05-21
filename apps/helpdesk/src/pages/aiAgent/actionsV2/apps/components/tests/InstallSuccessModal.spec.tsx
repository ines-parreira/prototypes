import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'

import { InstallSuccessModal } from '../InstallSuccessModal'

const renderComponent = (
    props?: Partial<React.ComponentProps<typeof InstallSuccessModal>>,
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <InstallSuccessModal
                    isOpen={true}
                    onOpenChange={jest.fn()}
                    appName="ShipMonk"
                    onViewActions={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('InstallSuccessModal', () => {
    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the connected heading with the app name', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Connected to ShipMonk' }),
        ).toBeInTheDocument()
    })

    it('renders the description with skills and guidance emphasized', () => {
        renderComponent()

        expect(screen.getByText(/Insert them in/i)).toBeInTheDocument()
        expect(screen.getByText('skills')).toBeInTheDocument()
        expect(screen.getByText('guidance')).toBeInTheDocument()
    })

    it('calls onViewActions when "View actions" is clicked', async () => {
        const user = userEvent.setup()
        const onViewActions = jest.fn()
        renderComponent({ onViewActions })

        const dialog = screen.getByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: /view actions/i }),
        )

        expect(onViewActions).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenChange(false) when "Dismiss" is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        const dialog = screen.getByRole('dialog')
        await user.click(
            within(dialog).getByRole('button', { name: /dismiss/i }),
        )

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange(false) when Escape is pressed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('focuses the primary "View actions" button on open', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /view actions/i }),
        ).toHaveFocus()
    })
})
