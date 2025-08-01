import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import EmailIntegrationConnectForm from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailIntegrationConnectForm'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
    UseEmailOnboardingHookResult,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'

jest.mock('pages/history', () => ({
    push: jest.fn(),
}))

const TestWrapper = ({
    emailAddress = '',
    displayName = '',
    handleEmailChange = jest.fn(),
    handleDisplayChange = jest.fn(),
    ...otherProps
}) => {
    const [showModal, setShowModal] = React.useState(false)

    const handleCancel = () => {
        if (emailAddress || displayName) {
            setShowModal(true)
        } else {
            const historyMock = require('pages/history')
            historyMock.push('/app/settings/channels/email')
        }
    }

    const handleBackToEditing = () => {
        setShowModal(false)
    }

    const handleDiscardIntegration = () => {
        const historyMock = require('pages/history')
        historyMock.push('/app/settings/channels/email')
    }

    return (
        <>
            <EmailIntegrationConnectForm
                emailAddress={emailAddress}
                displayName={displayName}
                handleEmailChange={handleEmailChange}
                handleDisplayChange={handleDisplayChange}
                handleCancel={handleCancel}
                {...otherProps}
            />
            {showModal && (
                <div>
                    EmailGenericModal
                    <button onClick={handleBackToEditing}>
                        Back to Editing
                    </button>
                    <button onClick={handleDiscardIntegration}>
                        Discard Email integration
                    </button>
                </div>
            )}
        </>
    )
}

const renderComponent = (props = {}) => render(<TestWrapper {...props} />)

jest.mock(
    'pages/integrations/integration/components/email/hooks/useEmailOnboarding',
)
jest.mock(
    'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons',
    () =>
        ({ integration, cancelCallback }: any) => (
            <div className="buttons">
                <div>
                    <button type="button" onClick={cancelCallback}>
                        Cancel
                    </button>
                    <button type="submit" disabled={true}>
                        Next
                    </button>
                </div>
                {integration && (
                    <button type="button">Delete integration</button>
                )}
            </div>
        ),
)
jest.mock(
    'pages/integrations/integration/components/email/components/EmailGenericModal',
    () =>
        ({ children, ...props }: any) =>
            props.showModal ? <div>EmailGenericModal {children}</div> : null,
)

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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with the appropriate fields', () => {
        renderComponent()

        expect(screen.getByText('Add your support email')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Set up the email your customers will see when you reply from Gorgias/,
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('textbox', {
                name: 'Email required',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', {
                name: 'Email display name required',
            }),
        ).toBeInTheDocument()

        expect(screen.getByText(/Please add a work email/)).toBeInTheDocument()
        expect(
            screen.getByText(
                /The display name will appear in emails sent to customers/,
            ),
        ).toBeInTheDocument()

        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    })

    it('should validate the email field', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email required',
            }),
            {
                target: { value: 'not-a-valid-email' },
            },
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Email format must include @ and a domain, e.g. example@domain.com',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should validate the display name field', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email display name required',
            }),
            {
                target: { value: '' },
            },
        )

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email required',
            }),
            {
                target: { value: 'acme@gorgias.test' },
            },
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(
                screen.getByText('This field is required'),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email display name required',
            }),
            {
                target: { value: 'invalid name <X>' },
            },
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'The name that customers will see when they receive emails from you. Cannot contain these characters: @,;<>[]',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should disable the email field if the integration already exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: existingIntegration,
        })

        renderComponent()

        const emailField = screen.getByRole('textbox', {
            name: 'Email required',
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
                name: 'Delete integration',
            }),
        ).toBeInTheDocument()
    })

    it('should call connectIntegration onSubmit', async () => {
        renderComponent()

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email display name required',
            }),
            {
                target: { value: 'Support address' },
            },
        )

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email required',
            }),
            {
                target: { value: 'acme@gorgias.test' },
            },
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.connectIntegration).toHaveBeenCalledWith({
                name: 'Support address',
                meta: { address: 'acme@gorgias.test' },
            })
        })
    })

    it('should show warning modal when canceling with data', () => {
        renderComponent({ emailAddress: 'test@example.com' })

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(screen.getByText('EmailGenericModal')).toBeInTheDocument()
    })

    it('should call handleEmailChange when email field changes', () => {
        const handleEmailChange = jest.fn()
        renderComponent({ handleEmailChange })

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email required',
            }),
            {
                target: { value: 'test@example.com' },
            },
        )

        expect(handleEmailChange).toHaveBeenCalledWith('test@example.com')
    })

    it('should call handleDisplayChange when display name field changes', () => {
        const handleDisplayChange = jest.fn()
        renderComponent({ handleDisplayChange })

        fireEvent.change(
            screen.getByRole('textbox', {
                name: 'Email display name required',
            }),
            {
                target: { value: 'Test Name' },
            },
        )

        expect(handleDisplayChange).toHaveBeenCalledWith('Test Name')
    })

    it('should close warning modal when "Back to Editing" button is clicked', () => {
        renderComponent({ emailAddress: 'test@example.com' })

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(screen.getByText('EmailGenericModal')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Back to Editing' }))

        expect(screen.queryByText('EmailGenericModal')).not.toBeInTheDocument()
    })

    it('should navigate to email settings when "Discard Email integration" button is clicked', () => {
        const historyMock = require('pages/history')
        renderComponent({ emailAddress: 'test@example.com' })

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(screen.getByText('EmailGenericModal')).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', { name: 'Discard Email integration' }),
        )

        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/settings/channels/email',
        )
    })

    it('should navigate directly to email settings when canceling without data', () => {
        const historyMock = require('pages/history')
        renderComponent({ emailAddress: '', displayName: '' })

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(screen.queryByText('EmailGenericModal')).not.toBeInTheDocument()
        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/settings/channels/email',
        )
    })
})
