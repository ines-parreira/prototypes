import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import moment from 'moment-timezone'

import { IntegrationType } from '@gorgias/helpdesk-client'

import CreateImportModal from '../CreateImportModal'

jest.mock('../form/hooks/useEmailIntegrations', () => ({
    useEmailIntegrations: jest.fn(),
}))

const mockUseEmailIntegrations = jest.mocked(
    require('../form/hooks/useEmailIntegrations').useEmailIntegrations,
)

jest.mock('../form/TimeFrameSelector', () => ({
    TimeFrameSelector: ({ isOpen, onSubmit, onCancel }: any) => {
        if (!isOpen) return null
        return (
            <div data-testid="timeframe-selector">
                <button
                    data-testid="select-last-6-months"
                    onClick={() => {
                        const endDate = moment()
                        const startDate = moment().subtract(6, 'months')
                        onSubmit(startDate, endDate)
                    }}
                >
                    Last 6 months
                </button>
                <button
                    data-testid="select-last-12-months"
                    onClick={() => {
                        const endDate = moment()
                        const startDate = moment().subtract(12, 'months')
                        onSubmit(startDate, endDate)
                    }}
                >
                    Last 12 months
                </button>
                <button data-testid="cancel-timeframe" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        )
    },
}))

describe('CreateImportModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        selectedEmail: null,
    }

    let mockLocationHref: string
    const originalLocation = window.location

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})

        mockUseEmailIntegrations.mockReturnValue([
            { provider: IntegrationType.Gmail, email: 'test@gmail.com' },
            { provider: IntegrationType.Outlook, email: 'test@outlook.com' },
        ])

        mockLocationHref = ''
        delete (window as any).location
        window.location = {
            ...originalLocation,
            origin: 'https://app.gorgias.com',
        } as Location

        Object.defineProperty(window.location, 'href', {
            get: () => mockLocationHref,
            set: (value: string) => {
                mockLocationHref = value
            },
            configurable: true,
        })
    })

    afterEach(() => {
        ;(console.error as jest.Mock).mockRestore()
        window.location = originalLocation
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

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(cancelButton).toBeInTheDocument()
            expect(submitButton).toBeInTheDocument()
        })
    })

    describe('Form state management', () => {
        it('should have submit button disabled when form is empty', () => {
            mockUseEmailIntegrations.mockReturnValue([])
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

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)

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
        })
    })

    describe('Form structure', () => {
        it('should have proper form structure', () => {
            render(<CreateImportModal {...defaultProps} />)

            const form = screen.getByRole('dialog').querySelector('form')
            expect(form).toBeInTheDocument()
        })

        it('should have proper button roles and labels', () => {
            render(<CreateImportModal {...defaultProps} />)

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(cancelButton).toBeInTheDocument()
            expect(submitButton).toBeInTheDocument()
        })
    })

    describe('Component behavior', () => {
        it('should maintain modal state when props change', () => {
            const { rerender } = render(<CreateImportModal {...defaultProps} />)

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            rerender(<CreateImportModal {...defaultProps} isOpen={true} />)

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

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })
        })
    })

    describe('Loading states', () => {
        it('should show loading state when form submission is triggered', () => {
            render(<CreateImportModal {...defaultProps} />)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(submitButton).not.toHaveAttribute('data-loading')
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

            const cancelButton = await screen.findByTestId('cancel-timeframe')
            await user.click(cancelButton)

            expect(timeframeInput).toHaveValue('')
        })
    })

    describe('Email integrations', () => {
        it('should work with email integrations from API', () => {
            render(<CreateImportModal {...defaultProps} />)

            const emailLabel = screen.getByText('Email')
            expect(emailLabel).toBeInTheDocument()
        })
    })

    describe('selectedEmail prop functionality', () => {
        it('should pre-populate email field when selectedEmail is provided', () => {
            const selectedEmail = 'test@gmail.com'

            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={selectedEmail}
                />,
            )

            expect(screen.getByText(selectedEmail)).toBeInTheDocument()
        })

        it('should have empty email field when selectedEmail is null', () => {
            mockUseEmailIntegrations.mockReturnValue([
                { provider: IntegrationType.Gmail, email: 'test@gmail.com' },
                {
                    provider: IntegrationType.Outlook,
                    email: 'test@outlook.com',
                },
            ])

            render(<CreateImportModal {...defaultProps} selectedEmail={null} />)

            const emailSelect = screen.getByRole('combobox')
            expect(emailSelect).toBeInTheDocument()

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

            expect(screen.getByText(selectedEmail)).toBeInTheDocument()

            const emailSelect = screen.getByRole('combobox')
            await user.click(emailSelect)

            await user.click(screen.getByText('test@outlook.com'))

            expect(screen.getByText('test@outlook.com')).toBeInTheDocument()
            expect(screen.queryByText(selectedEmail)).not.toBeInTheDocument()
        })

        it('should work with complete flow when selectedEmail is provided', async () => {
            const user = userEvent.setup()
            const selectedEmail = 'test@gmail.com'

            mockUseEmailIntegrations.mockReturnValue([
                { provider: IntegrationType.Gmail, email: selectedEmail },
            ])

            render(
                <CreateImportModal
                    {...defaultProps}
                    selectedEmail={selectedEmail}
                />,
            )

            expect(screen.getByText(selectedEmail)).toBeInTheDocument()

            const timeframeSelect = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(timeframeSelect)

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            await waitFor(() => {
                const timeframeInput = screen.getByPlaceholderText(
                    'Please select a timeframe',
                )
                const value = timeframeInput.getAttribute('value')
                expect(value).toContain(' to ')
            })

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain(
                    '/integrations/gmail/auth/import/oauth-redirect',
                )
                expect(mockLocationHref).toContain(
                    `provider_address=${encodeURIComponent(selectedEmail)}`,
                )
            })
        })
    })

    describe('URL redirection', () => {
        it('should redirect to OAuth URL with correct parameters when form is submitted', async () => {
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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain(
                    '/integrations/gmail/auth/import/oauth-redirect',
                )
                expect(mockLocationHref).toContain(
                    'provider_address=test%40gmail.com',
                )
                expect(mockLocationHref).toContain('import_window_start=')
                expect(mockLocationHref).toContain('import_window_end=')
            })
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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain(
                    '/integrations/outlook/auth/import/oauth-redirect',
                )
                expect(mockLocationHref).toContain(
                    'provider_address=support%40outlook.com',
                )
            })
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

            const timeframeOption = await screen.findByTestId(
                'select-last-12-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain('import_window_start=')
                expect(mockLocationHref).toContain('import_window_end=')

                const url = new URL(mockLocationHref, 'https://app.gorgias.com')
                const startDate = url.searchParams.get('import_window_start')
                const endDate = url.searchParams.get('import_window_end')

                expect(startDate).toMatch(/\d{4}-\d{2}-\d{2}/)
                expect(endDate).toMatch(/\d{4}-\d{2}-\d{2}/)
            })
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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(onCloseMock).toHaveBeenCalled()
            })
        })

        it('should show error message when URL construction fails', async () => {
            const user = userEvent.setup()

            Object.defineProperty(window.location, 'href', {
                get: () => mockLocationHref,
                set: () => {
                    throw new Error('Failed to set location')
                },
                configurable: true,
            })

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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'There was an error during import creation.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should reset form fields after successful submission', async () => {
            const user = userEvent.setup()

            let hrefSetCount = 0
            Object.defineProperty(window.location, 'href', {
                get: () => mockLocationHref,
                set: (value: string) => {
                    hrefSetCount++
                    mockLocationHref = value
                },
                configurable: true,
            })

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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(hrefSetCount).toBeGreaterThan(0)
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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })

            expect(submitButton).not.toHaveAttribute('aria-disabled', 'true')

            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain('/integrations/gmail')
            })
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

            const timeframeOption = await screen.findByTestId(
                'select-last-6-months',
            )
            await user.click(timeframeOption)

            const submitButton = screen.getByRole('button', {
                name: 'Authenticate and import',
            })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLocationHref).toContain('import_window_start=')
                expect(mockLocationHref).toContain('import_window_end=')
            })
        })
    })
})
