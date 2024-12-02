import {EmailIntegration} from '@gorgias/api-queries'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import EmailIntegrationConnectForm from '../EmailIntegrationConnectForm'
import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

const renderComponent = () => render(<EmailIntegrationConnectForm />)

jest.mock('../hooks/useEmailOnboarding')

const defaultHookResult: UseEmailOnboardingHookResult = {
    integration: undefined,
    isConnecting: false,
    isConnected: false,
    isSending: false,
    isPending: false,
    isVerified: false,
    isDeleting: false,
    isRequested: false,
    currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
    connectIntegration: jest.fn(),
    sendVerification: jest.fn(),
    deleteIntegration: jest.fn(),
    goBack: jest.fn(),
    goToNext: jest.fn(),
    errors: undefined,
}

const existingIntegration = {
    id: 1,
    name: 'Acme',
    meta: {
        address: 'acme@gorgias.test',
    },
} as EmailIntegration

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationConnectForm />', () => {
    it('should render with the appropriate fields', () => {
        renderComponent()

        expect(
            screen.getByText('Connect your support email')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'In order to email your customers through Gorgias, you need to connect your support email. Enter the email address you currently use to talk with customers and then choose a display name that customers will see on your responses.'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByRole('textbox', {
                name: 'Support email address required',
            })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', {
                name: 'Display name required',
            })
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Enter the email address you currently use to talk with customers.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]'
            )
        ).toBeInTheDocument()

        expect(screen.getByRole('button', {name: 'Next'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Next'})).toBeAriaDisabled()
    })

    it('should validate the email field', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Support email address required',
            }),
            {
                target: {value: 'not-a-valid-email'},
            }
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Email format must include @ and a domain, e.g. example@domain.com'
                )
            ).toBeInTheDocument()
        })
    })

    it('should validate the display name field', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Display name required',
            }),
            {
                target: {value: ''},
            }
        )

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Support email address required',
            }),
            {
                target: {value: 'acme@gorgias.test'},
            }
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(
                screen.getByText('This field is required')
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Display name required',
            }),
            {
                target: {value: 'invalid name <X>'},
            }
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]'
                )
            ).toBeInTheDocument()
        })
    })

    it('should show the loading state on the submit button', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isConnecting: true,
        })

        renderComponent()

        const submitButton = screen.getByRole('button', {
            name: 'Loading... Next',
        })

        expect(submitButton).toBeInTheDocument()
        expect(submitButton).toBeAriaDisabled()
    })

    it('should disable the email field if the integration already exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: existingIntegration,
        })

        renderComponent()

        const emailField = screen.getByRole('textbox', {
            name: 'Support email address required',
        })

        expect(emailField).toBeInTheDocument()
        expect(emailField).toBeDisabled()
    })

    it('should show the delete integration button if the integration exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: existingIntegration,
        })

        renderComponent()

        expect(
            screen.getByRole('button', {
                name: 'delete Delete integration',
            })
        ).toBeInTheDocument()
    })

    it('should call connectIntegration onSubmit', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Display name required',
            }),
            {
                target: {value: 'Support address'},
            }
        )

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Support email address required',
            }),
            {
                target: {value: 'acme@gorgias.test'},
            }
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.connectIntegration).toHaveBeenCalledWith({
                name: 'Support address',
                meta: {address: 'acme@gorgias.test'},
            })
        })
    })
})
