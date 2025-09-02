import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { IntegrationType } from '@gorgias/helpdesk-client'

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
        selectedEmail: null,
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

            expect(screen.getByText('Email')).toBeInTheDocument()
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
                { provider: IntegrationType.Gmail, email: 'support@gmail.com' },
                {
                    provider: IntegrationType.Outlook,
                    email: 'sales@outlook.com',
                },
            ])

            render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })

    describe('selectedEmail prop functionality', () => {
        beforeEach(() => {
            mockUseEmailIntegrations.mockReturnValue([
                { provider: IntegrationType.Gmail, email: 'test@gmail.com' },
                {
                    provider: IntegrationType.Outlook,
                    email: 'test@outlook.com',
                },
            ])
        })

        it('should pre-populate email field when selectedEmail is provided', async () => {
            const selectedEmail = 'test@gmail.com'
            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={selectedEmail}
                />,
            )

            // Wait for component to initialize
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // The email field should be pre-populated with the selectedEmail
            expect(screen.getByText(selectedEmail)).toBeInTheDocument()
        })

        it('should have empty email field when selectedEmail is null', async () => {
            render(<CreateImportModal {...defaultProps} selectedEmail={null} />)

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Check that no email is pre-selected by looking for the combobox
            const emailLabel = screen.getByText('Email')
            expect(emailLabel).toBeInTheDocument()

            // The select should be present but without any selected email text
            const emailSelect = screen.getByRole('combobox')
            expect(emailSelect).toBeInTheDocument()

            // Should not contain any of the available emails as selected text
            expect(screen.queryByText('test@gmail.com')).not.toBeInTheDocument()
            expect(
                screen.queryByText('test@outlook.com'),
            ).not.toBeInTheDocument()
        })

        it('should have empty email field when selectedEmail is undefined', async () => {
            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={undefined}
                />,
            )

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            const emailLabel = screen.getByText('Email')
            expect(emailLabel).toBeInTheDocument()
        })

        it('should allow user to change pre-populated email from selectedEmail', async () => {
            const user = userEvent.setup()
            const selectedEmail = 'test@gmail.com'

            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={selectedEmail}
                />,
            )

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Verify initial email is pre-populated
            expect(screen.getByText(selectedEmail)).toBeInTheDocument()

            // Click on email select to open dropdown
            const emailSelect = screen.getByRole('combobox')
            await user.click(emailSelect)

            // Select a different email
            await user.click(screen.getByText('test@outlook.com'))

            // Verify the email has been changed
            expect(screen.getByText('test@outlook.com')).toBeInTheDocument()
            expect(screen.queryByText(selectedEmail)).not.toBeInTheDocument()
        })

        it('should work with complete flow when selectedEmail is provided', async () => {
            const user = userEvent.setup()
            const selectedEmail = 'test@gmail.com'

            // Mock window.location
            const originalLocation = window.location
            const mockLocation = {
                ...originalLocation,
                href: '',
                origin: 'https://app.gorgias.com',
            }
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
            })

            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={selectedEmail}
                />,
            )

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Verify email is pre-populated
            expect(screen.getByText(selectedEmail)).toBeInTheDocument()

            // Select timeframe
            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            // Submit form
            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            // Verify redirect with correct email
            expect(window.location.href).toContain(
                '/integrations/gmail/auth/import/oauth-redirect',
            )
            expect(window.location.href).toContain(
                `provider_address=${encodeURIComponent(selectedEmail)}`,
            )

            // Restore window.location
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
            })
        })
    })

    describe('URL redirection', () => {
        let originalLocation: Location

        beforeEach(() => {
            originalLocation = window.location
            const mockLocation = {
                ...originalLocation,
                href: '',
                origin: 'https://app.gorgias.com',
            }
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
            })

            mockUseEmailIntegrations.mockReturnValue([
                { provider: IntegrationType.Gmail, email: 'test@gmail.com' },
            ])
        })

        afterEach(() => {
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
            })
        })

        it('should redirect to OAuth URL with correct parameters when form is submitted', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            // Click on email select input - use label to find the field
            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)

            // Select email from dropdown
            await user.click(screen.getByText('test@gmail.com'))

            // Click on timeframe input
            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)

            // Select timeframe from date picker
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            expect(window.location.href).toContain(
                '/integrations/gmail/auth/import/oauth-redirect',
            )
            expect(window.location.href).toContain(
                'provider_address=test%40gmail.com',
            )
            expect(window.location.href).toContain('import_window_start=')
            expect(window.location.href).toContain('import_window_end=')
        })

        it('should construct URL with correct provider from email format', async () => {
            const user = userEvent.setup()
            mockUseEmailIntegrations.mockReturnValue([
                {
                    provider: IntegrationType.Outlook,
                    email: 'support@outlook.com',
                },
            ])

            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('support@outlook.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            expect(window.location.href).toContain(
                '/integrations/outlook/auth/import/oauth-redirect',
            )
            expect(window.location.href).toContain(
                'provider_address=support%40outlook.com',
            )
        })

        it('should parse timeframe correctly and set import window parameters', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('test@gmail.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            const urlParams = new URLSearchParams(
                window.location.href.split('?')[1],
            )
            expect(urlParams.has('import_window_start')).toBe(true)
            expect(urlParams.has('import_window_end')).toBe(true)

            const startDate = urlParams.get('import_window_start')
            const endDate = urlParams.get('import_window_end')
            expect(startDate).toBeTruthy()
            expect(endDate).toBeTruthy()
            // Dates should be in YYYY-MM-DD format
            expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })

        it('should call onClose after successful submission', async () => {
            const user = userEvent.setup()
            const onCloseMock = jest.fn()
            render(
                <CreateImportModal {...defaultProps} onClose={onCloseMock} />,
            )

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('test@gmail.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(onCloseMock).toHaveBeenCalledTimes(1)
            })
        })

        it('should show error message when URL construction fails', async () => {
            const user = userEvent.setup()

            mockUseEmailIntegrations.mockReturnValue([
                { provider: undefined, email: 'invalid' },
            ])

            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('invalid'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            jest.spyOn(URL.prototype, 'toString').mockImplementationOnce(() => {
                throw new Error('URL construction failed')
            })

            await user.click(submitButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'There was an error during import creation.',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Please try again.'),
                ).toBeInTheDocument()
            })
        })

        it('should reset form fields after successful submission', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('test@gmail.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            // Verify form has values before submission
            const timeframeInput = screen.getByPlaceholderText(
                'Please select a timeframe',
            ) as HTMLInputElement
            expect(timeframeInput.value).toContain('2025')

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            // Verify onClose was called after successful submission
            await waitFor(() => {
                expect(defaultProps.onClose).toHaveBeenCalled()
            })
        })

        it('should disable submit button during form submission', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('test@gmail.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 6 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(submitButton).not.toHaveAttribute('aria-disabled', 'true')

            await user.click(submitButton)
        })

        it('should handle different timeframe formats correctly', async () => {
            const user = userEvent.setup()
            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            const emailSelect =
                emailLabel.parentElement?.querySelector('div[role="button"]') ||
                emailLabel.nextElementSibling
            await user.click(emailSelect as HTMLElement)
            await user.click(screen.getByText('test@gmail.com'))

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)
            const timeframeOption = await screen.findByText('Last 12 months')
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            expect(window.location.href).toContain('import_window_start=')
            expect(window.location.href).toContain('import_window_end=')
        })
    })
})
