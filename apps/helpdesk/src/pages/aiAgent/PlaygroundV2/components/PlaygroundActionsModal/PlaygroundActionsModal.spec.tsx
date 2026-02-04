import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import PlaygroundActionsModal from './PlaygroundActionsModal'

jest.mock('@repo/hooks', () => ({
    useSessionStorage: jest.fn((key, defaultValue) => {
        const [value, setValue] = React.useState(defaultValue)
        return [value, setValue]
    }),
    useId: jest.fn(() => 'mock-id'),
    useKey: jest.fn(),
}))

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
}

describe('PlaygroundActionsModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal when open', () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        expect(
            screen.getByText('Enable Actions in test mode?'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'When Actions are triggered in test mode, they use live customer data. This means:',
            ),
        ).toBeInTheDocument()
    })

    it('should display warning list items', () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        expect(
            screen.getByText('Customer data may be updated or deleted'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Real orders may be modified or cancelled'),
        ).toBeInTheDocument()
        expect(screen.getByText('Changes cannot be undone')).toBeInTheDocument()
    })

    it('should display confirmation checkbox with label', () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(
            screen.getByText(
                'I understand that enabling Actions in test mode may cause irreversible changes to live customer data.',
            ),
        ).toBeInTheDocument()
    })

    it('should have Enable Actions button disabled initially', () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })
        expect(enableButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should enable Enable Actions button when checkbox is checked', async () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })

        expect(enableButton).toHaveAttribute('aria-disabled', 'true')

        await userEvent.click(checkbox)

        await waitFor(() => {
            expect(enableButton).toHaveAttribute('aria-disabled', 'false')
        })
    })

    it('should call onClose when Cancel button is clicked', async () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        await userEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Enable Actions is clicked with checkbox checked', async () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await userEvent.click(checkbox)

        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })
        await userEvent.click(enableButton)

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not render modal when isOpen is false', () => {
        renderWithTheme(
            <PlaygroundActionsModal {...defaultProps} isOpen={false} />,
        )

        expect(
            screen.queryByText('Enable Actions in test mode?'),
        ).not.toBeInTheDocument()
    })

    it('should toggle checkbox state when clicking multiple times', async () => {
        renderWithTheme(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')

        expect(checkbox).not.toBeChecked()

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).toBeChecked())

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).not.toBeChecked())

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).toBeChecked())
    })
})
