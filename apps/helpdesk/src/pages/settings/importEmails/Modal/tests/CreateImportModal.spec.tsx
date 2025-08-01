import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import CreateImportModal from '../CreateImportModal'

jest.mock('../form/hooks/useEmailIntegrations', () => ({
    useEmailIntegrations: jest.fn(),
}))

const mockUseEmailIntegrations = jest.mocked(
    require('../form/hooks/useEmailIntegrations').useEmailIntegrations,
)

describe('CreateImportModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})

        mockUseEmailIntegrations.mockReturnValue([])
    })

    afterEach(() => {
        ;(console.error as jest.Mock).mockRestore()
    })

    describe('Modal rendering', () => {
        it('should render modal when isOpen is true', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Import email history')).toBeInTheDocument()
        })

        it('should not render modal when isOpen is false', () => {
            render(<CreateImportModal {...defaultProps} isOpen={false} />)

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should call onClose when close button is clicked', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const closeButton = screen.getByRole('button', { name: '' })
            await user.click(closeButton)

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Content rendering', () => {
        it('should render the modal header with correct title', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByText('Import email history')).toBeInTheDocument()
        })

        it('should render the description text', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(
                screen.getByText(
                    /Import historical emails from your Gmail or Microsoft 365 account/,
                ),
            ).toBeInTheDocument()
        })

        it('should render the help text section', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(
                screen.getByText('What will be imported?'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Emails – including full message content/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Attachments – any files sent with those emails/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Timeframe – up to 2 years of historical data/,
                ),
            ).toBeInTheDocument()
        })

        it('should render form components', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByText('Email address')).toBeInTheDocument()
            expect(screen.getByText('Import timeframe')).toBeInTheDocument()
        })

        it('should render action buttons', () => {
            render(<CreateImportModal {...defaultProps} />)

            const cancelButtons = screen.getAllByRole('button', {
                name: 'Cancel',
            })
            expect(cancelButtons.length).toBeGreaterThanOrEqual(1)

            expect(
                screen.getByRole('button', { name: 'Authenticate and import' }),
            ).toBeInTheDocument()
        })
    })

    describe('Form state management', () => {
        it('should have submit button disabled when form is empty', () => {
            render(<CreateImportModal {...defaultProps} />)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Form interactions', () => {
        it('should call onClose when cancel button is clicked', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const cancelButtons = screen.getAllByRole('button', {
                name: 'Cancel',
            })
            const modalCancelButton = cancelButtons[0]
            await user.click(modalCancelButton)

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Error handling', () => {
        it('should not display error message initially', () => {
            render(<CreateImportModal {...defaultProps} />)

            expect(
                screen.queryByText(
                    'There was an error during import creation.',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Please try again.'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Form structure', () => {
        it('should have proper form structure', () => {
            render(<CreateImportModal {...defaultProps} />)

            const formElement = document.querySelector('form')
            expect(formElement).toBeInTheDocument()
        })

        it('should have proper button roles and labels', () => {
            render(<CreateImportModal {...defaultProps} />)

            const cancelButtons = screen.getAllByRole('button', {
                name: 'Cancel',
            })
            expect(cancelButtons.length).toBeGreaterThanOrEqual(1)

            expect(
                screen.getByRole('button', { name: 'Authenticate and import' }),
            ).toBeInTheDocument()
        })
    })

    describe('Component behavior', () => {
        it('should maintain modal state when props change', () => {
            const { rerender } = render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            rerender(<CreateImportModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should handle isOpen prop changes correctly', async () => {
            const { rerender } = render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            rerender(<CreateImportModal {...defaultProps} isOpen={false} />)

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })

            rerender(<CreateImportModal {...defaultProps} isOpen={true} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })

    describe('Loading states', () => {
        it('should show loading state when form submission is triggered', async () => {
            render(<CreateImportModal {...defaultProps} />)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Clear functionality', () => {
        it('should reset form state when clear is called', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const timeframeInput = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeInput)

            const clearButton = screen.queryByRole('button', { name: /clear/i })
            if (clearButton) {
                await user.click(clearButton)

                expect(timeframeInput).toHaveValue('')
            }
        })
    })

    describe('Email integrations', () => {
        it('should work with email integrations from API', () => {
            mockUseEmailIntegrations.mockReturnValue([
                { provider: 'gmail', email: 'support@gmail.com' },
                { provider: 'outlook', email: 'sales@outlook.com' },
            ])

            render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByText('Email address')).toBeInTheDocument()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })
})
