import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ZendeskImportForm } from '../ZendeskImportForm'

describe('ZendeskImportForm', () => {
    const defaultProps = {
        formState: {
            subdomain: '',
            loginEmail: '',
            apiKey: '',
        },
        formErrors: {
            emailError: '',
        },
        formActions: {
            setSubdomain: jest.fn(),
            setLoginEmail: jest.fn(),
            setApiKey: jest.fn(),
        },
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render all form fields', () => {
        render(<ZendeskImportForm {...defaultProps} />)

        expect(
            screen.getByRole('textbox', { name: /zendesk subdomain/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /login email/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /add the email address used to login to your zendesk account/i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /api key/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/in zendesk, go to settings > channels > api/i),
        ).toBeInTheDocument()

        expect(screen.getByText('.zendesk.com')).toBeInTheDocument()
    })

    it('should display field values', () => {
        const props = {
            ...defaultProps,
            formState: {
                subdomain: 'acme',
                loginEmail: 'test@example.com',
                apiKey: 'test-api-key',
            },
        }

        render(<ZendeskImportForm {...props} />)

        expect(
            screen.getByRole('textbox', { name: /zendesk subdomain/i }),
        ).toHaveValue('acme')
        expect(
            screen.getByRole('textbox', { name: /login email/i }),
        ).toHaveValue('test@example.com')
        expect(screen.getByRole('textbox', { name: /api key/i })).toHaveValue(
            'test-api-key',
        )
    })

    it('should call setSubdomain when subdomain input changes', async () => {
        const user = userEvent.setup()
        render(<ZendeskImportForm {...defaultProps} />)

        const subdomainInput = screen.getByRole('textbox', {
            name: /zendesk subdomain/i,
        })

        await act(() => user.type(subdomainInput, 'acme'))

        expect(defaultProps.formActions.setSubdomain).toHaveBeenCalledWith('a')
        expect(defaultProps.formActions.setSubdomain).toHaveBeenCalledWith('c')
        expect(defaultProps.formActions.setSubdomain).toHaveBeenCalledWith('m')
        expect(defaultProps.formActions.setSubdomain).toHaveBeenCalledWith('e')
    })

    it('should call setLoginEmail when email input changes', async () => {
        const user = userEvent.setup()
        render(<ZendeskImportForm {...defaultProps} />)

        const emailInput = screen.getByRole('textbox', {
            name: /login email/i,
        })

        await act(() => user.type(emailInput, 'test@example.com'))

        expect(defaultProps.formActions.setLoginEmail).toHaveBeenCalled()
    })

    it('should call setApiKey when API key input changes', async () => {
        const user = userEvent.setup()
        render(<ZendeskImportForm {...defaultProps} />)

        const apiKeyInput = screen.getByRole('textbox', { name: /api key/i })

        await act(() => user.type(apiKeyInput, 'test-key'))

        expect(defaultProps.formActions.setApiKey).toHaveBeenCalled()
    })

    it('should call onSubmit when form is submitted', () => {
        render(<ZendeskImportForm {...defaultProps} />)

        const form = screen
            .getByRole('textbox', {
                name: /zendesk subdomain/i,
            })
            .closest('form')!

        fireEvent.submit(form)

        expect(defaultProps.onSubmit).toHaveBeenCalled()
    })

    it('should display placeholder text', () => {
        render(<ZendeskImportForm {...defaultProps} />)

        expect(screen.getByPlaceholderText('acme')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('support@yourcompany.com'),
        ).toBeInTheDocument()
        expect(screen.getByPlaceholderText('API key')).toBeInTheDocument()
    })

    it('should mark all fields as required', () => {
        render(<ZendeskImportForm {...defaultProps} />)

        const subdomainInput = screen.getByRole('textbox', {
            name: /zendesk subdomain/i,
        })
        const emailInput = screen.getByRole('textbox', {
            name: /login email/i,
        })
        const apiKeyInput = screen.getByRole('textbox', { name: /api key/i })

        expect(subdomainInput).toBeRequired()
        expect(emailInput).toBeRequired()
        expect(apiKeyInput).toBeRequired()
    })

    it('should display email error when emailError is provided', () => {
        const props = {
            ...defaultProps,
            formState: {
                ...defaultProps.formState,
                loginEmail: 'invalid-email',
            },
            formErrors: {
                emailError: 'Please enter a valid email address',
            },
        }

        render(<ZendeskImportForm {...props} />)

        expect(
            screen.getByText('Please enter a valid email address'),
        ).toBeInTheDocument()
    })
})
