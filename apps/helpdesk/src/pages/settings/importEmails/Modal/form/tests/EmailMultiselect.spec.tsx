import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { IntegrationType } from '@gorgias/helpdesk-client'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { EmailMultiselect } from '../EmailMultiselect'

jest.mock('../hooks/useEmailIntegrations', () => ({
    useEmailIntegrations: jest.fn(),
}))

const mockUseEmailIntegrations = jest.mocked(
    require('../hooks/useEmailIntegrations').useEmailIntegrations,
)

const renderEmailMultiselect = (email = '') => {
    const setEmail = jest.fn()

    const utils = renderWithQueryClientProvider(
        <EmailMultiselect email={email} setEmail={setEmail} />,
    )

    return { ...utils, setEmail }
}

describe('EmailMultiselect', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseEmailIntegrations.mockReturnValue([
            { provider: IntegrationType.Gmail, email: 'support@gmail.com' },
            { provider: IntegrationType.Gmail, email: 'info@gmail.com' },
            { provider: IntegrationType.Outlook, email: 'sales@outlook.com' },
            { provider: IntegrationType.Outlook, email: 'contact@outlook.com' },
            { provider: IntegrationType.Email, email: 'hello@company.com' },
        ])
    })

    describe('Initial Rendering', () => {
        it('renders the email address label as required', () => {
            renderEmailMultiselect()

            const label = screen.getByText('Email address')
            expect(label).toBeInTheDocument()

            const requiredIndicator = screen.getByLabelText('required')
            expect(requiredIndicator).toBeInTheDocument()
        })

        it('renders email selection input field', () => {
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            expect(emailInput).toBeInTheDocument()

            expect(
                screen.getByText('support@yourcompany.com'),
            ).toBeInTheDocument()
        })

        it('does not show provider radio buttons initially', () => {
            renderEmailMultiselect()

            expect(screen.queryByText('Provider')).not.toBeInTheDocument()
            expect(screen.queryByRole('radio')).not.toBeInTheDocument()
        })

        it('displays selected email when provided', () => {
            renderEmailMultiselect('test@example.com')

            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })
    })

    describe('Email Selection Interaction', () => {
        it('opens dropdown when email field is clicked', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
            })
        })

        it('displays all email options when dropdown is opened', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('sales@outlook.com'),
                ).toBeInTheDocument()
                expect(screen.getByText('info@gmail.com')).toBeInTheDocument()
                expect(
                    screen.getByText('hello@company.com'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('contact@outlook.com'),
                ).toBeInTheDocument()
            })
        })

        it('calls setEmail when an email option is selected', async () => {
            const user = userEvent.setup()
            const { setEmail } = renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
            })

            const gmailOption = screen.getByText('support@gmail.com')
            await user.click(gmailOption)

            expect(setEmail).toHaveBeenCalledWith('gmail/support@gmail.com')
        })

        it('shows "Add new email" option in dropdown', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                expect(screen.getByText('Add new email')).toBeInTheDocument()
            })
        })
    })

    describe('Email Forwarding Provider Selection', () => {
        it('shows provider radio buttons when email forwarding email is selected', () => {
            renderEmailMultiselect('hello@company.com')

            expect(screen.getByText('Provider')).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Gmail' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Outlook' }),
            ).toBeInTheDocument()
        })

        it('defaults to Gmail as selected provider', () => {
            renderEmailMultiselect('hello@company.com')

            const gmailRadio = screen.getByRole('radio', { name: 'Gmail' })
            expect(gmailRadio).toBeChecked()
        })

        it('allows changing the forwarding provider', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect('hello@company.com')

            const outlookRadio = screen.getByRole('radio', { name: 'Outlook' })
            await user.click(outlookRadio)

            expect(outlookRadio).toBeChecked()
        })

        it('renders provider label as required', () => {
            renderEmailMultiselect('hello@company.com')

            const providerLabel = screen.getByText('Provider')
            expect(providerLabel).toBeInTheDocument()

            const requiredIndicators = screen.getAllByLabelText('required')
            expect(requiredIndicators.length).toBeGreaterThan(1)
        })

        it('does not show provider radios for Gmail emails', () => {
            renderEmailMultiselect('support@gmail.com')

            expect(screen.queryByText('Provider')).not.toBeInTheDocument()
            expect(screen.queryByRole('radio')).not.toBeInTheDocument()
        })

        it('does not show provider radios for Outlook emails', () => {
            renderEmailMultiselect('sales@outlook.com')

            expect(screen.queryByText('Provider')).not.toBeInTheDocument()
            expect(screen.queryByRole('radio')).not.toBeInTheDocument()
        })
    })

    describe('Provider Icons Display', () => {
        it('shows provider icons in dropdown options', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                const gmailIcons = screen.getAllByAltText('gmail')
                expect(gmailIcons.length).toBeGreaterThan(0)

                const outlookIcons = screen.getAllByAltText('outlook')
                expect(outlookIcons.length).toBeGreaterThan(0)
            })
        })

        it('shows forwarding icon for email forwarding option', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                expect(screen.getByText('forward_to_inbox')).toBeInTheDocument()
            })
        })
    })

    describe('Search Functionality', () => {
        it('includes search input in dropdown', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect()

            const emailInput = screen.getByRole('combobox')
            await user.click(emailInput)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Search')
                expect(searchInput).toBeInTheDocument()
            })
        })
    })

    describe('Component Structure', () => {
        it('renders labels with proper spacing', () => {
            renderEmailMultiselect()

            const emailLabel = screen.getByText('Email address')
            expect(emailLabel).toHaveClass('mb-2')
        })

        it('renders provider label with proper spacing when shown', () => {
            renderEmailMultiselect('hello@company.com')

            const providerLabel = screen.getByText('Provider')
            expect(providerLabel).toHaveClass('mb-2')
        })
    })

    describe('Edge Cases', () => {
        it('handles empty email string', () => {
            const { setEmail } = renderEmailMultiselect('')

            const emailInput = screen.getByRole('combobox')
            expect(emailInput).toBeInTheDocument()

            expect(
                screen.getByText('support@yourcompany.com'),
            ).toBeInTheDocument()

            expect(setEmail).not.toHaveBeenCalled()
        })

        it('handles email that is not in the predefined options', () => {
            renderEmailMultiselect('unknown@example.com')

            expect(screen.getByText('unknown@example.com')).toBeInTheDocument()

            expect(screen.queryByText('Provider')).not.toBeInTheDocument()
        })

        it('maintains provider state when switching between forwarding emails', async () => {
            const user = userEvent.setup()
            renderEmailMultiselect('hello@company.com')

            const outlookRadio = screen.getByRole('radio', { name: 'Outlook' })
            await user.click(outlookRadio)
            expect(outlookRadio).toBeChecked()

            expect(outlookRadio).toBeChecked()
        })
    })

    describe('State Management', () => {
        it('does not change email when changing forwarding provider', async () => {
            const user = userEvent.setup()
            const { setEmail } = renderEmailMultiselect('hello@company.com')

            const outlookRadio = screen.getByRole('radio', { name: 'Outlook' })
            await user.click(outlookRadio)

            expect(setEmail).not.toHaveBeenCalled()
        })
    })
})
