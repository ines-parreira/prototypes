import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { DisableIntentModal } from './DisableIntentModal'

Element.prototype.getAnimations = jest.fn(() => [])

describe('DisableIntentModal', () => {
    const renderComponent = (
        props: Partial<Parameters<typeof DisableIntentModal>[0]> = {},
    ) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            onConfirm: jest.fn(),
        }
        return render(
            <ThemeProvider>
                <DisableIntentModal {...defaultProps} {...props} />
            </ThemeProvider>,
        )
    }

    it('should render title and body when open', () => {
        renderComponent()

        expect(screen.getByText('Disable intent?')).toBeInTheDocument()
        expect(
            screen.getByText(/AI Agent will stop handling this intent/i),
        ).toBeInTheDocument()
    })

    it('should display traffic percent when provided', () => {
        renderComponent({ trafficPercent: 30 })

        expect(screen.getByText(/30%/)).toBeInTheDocument()
    })

    it('should display fallback copy when trafficPercent is not provided', () => {
        renderComponent({ trafficPercent: undefined })

        expect(
            screen.getByText(
                /automatically hand over tickets matching this intent/i,
            ),
        ).toBeInTheDocument()
    })

    it('should not render when closed', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByText('Disable intent?')).not.toBeInTheDocument()
    })

    it('should call onConfirm when Disable button is clicked', async () => {
        const user = userEvent.setup()
        const onConfirm = jest.fn()
        renderComponent({ onConfirm })

        await user.click(screen.getByRole('button', { name: /disable/i }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderComponent({ onClose })

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should show loading state on Disable button', () => {
        renderComponent({ isLoading: true })

        const disableButton = screen.getByRole('button', { name: /disable/i })
        expect(disableButton).toBeDisabled()
    })
})
