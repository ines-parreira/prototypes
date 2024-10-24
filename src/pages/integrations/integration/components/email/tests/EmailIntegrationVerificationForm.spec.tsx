import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {EmailIntegration} from 'models/integration/types'
import EmailIntegrationVerificationForm from 'pages/integrations/integration/components/email/EmailIntegrationVerificationForm'
import {assumeMock} from 'utils/testing'

import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

const renderComponent = () => render(<EmailIntegrationVerificationForm />)

jest.mock('../hooks/useEmailOnboarding')
const existingIntegration = {
    id: 1,
    name: 'Acme',
    meta: {
        address: 'acme@gorgias.test',
    },
} as EmailIntegration
jest.mock(
    '../BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />'
)

const defaultHookResult = {
    currentStep: EmailIntegrationOnboardingStep.Verification,
    integration: existingIntegration,
    sendVerification: jest.fn(),
    isRequested: true,
} as unknown as UseEmailOnboardingHookResult

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationVerificationForm />', () => {
    it('should render the default pending state', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isPending: true,
        })
        renderComponent()

        expect(
            screen.getByText('Verification in progress...')
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /We are waiting for the verification email we sent to/
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText('acme@gorgias.test', {selector: 'span'})
        ).toBeInTheDocument()

        expect(
            screen.getByText(/This process can take up to 1 minute/)
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'markunread Re-Send Verification Email',
            })
        ).toBeInTheDocument()
    })

    it('should render the verified state', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isVerified: true,
        })
        renderComponent()
        expect(
            screen.getByText(
                'Your emails will appear in your Gorgias inbox as tickets.'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /Your email integration has been verified! Your customer emails will now appear in Gorgias as tickets you can handle directly from your inbox./
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText('Learn more about handling tickets.', {
                selector: 'a',
            })
        ).toBeInTheDocument()
    })

    it('should render the failed state', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isPending: false,
        })
        renderComponent()
        expect(
            screen.getByText("We haven't received your forwarded email.")
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /Please check you’ve set up the forwarding settings correctly in your support email settings and then resend the verification email to try again./
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'View step-by-step email forwarding setup guides.',
                {
                    selector: 'a',
                }
            )
        ).toBeInTheDocument()
    })

    it('should render as checked if the request has been made', async () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
        })

        renderComponent()

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.sendVerification).toHaveBeenCalled()
        })
    })
})
