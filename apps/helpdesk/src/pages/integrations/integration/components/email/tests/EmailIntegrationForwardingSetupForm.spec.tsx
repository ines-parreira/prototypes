import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'

import EmailIntegrationForwardingSetupForm from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailIntegrationForwardingSetupForm'
import type { UseEmailOnboardingHookResult } from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'

const renderComponent = () => render(<EmailIntegrationForwardingSetupForm />)

jest.mock(
    'pages/integrations/integration/components/email/hooks/useEmailOnboarding',
)
jest.mock(
    'pages/integrations/integration/components/email/BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />',
)
jest.mock(
    'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons',
    () => () => <div>EmailIntegrationOnboardingButtons</div>,
)
jest.mock(
    'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailForwardingInstructions',
    () => () => <div>EmailForwardingInstructions</div>,
)

const existingIntegration = {
    id: 1,
    name: 'Acme',
    meta: {
        address: 'acme@gorgias.test',
    },
} as EmailIntegration

const defaultHookResult = {
    currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
    integration: existingIntegration,
    sendVerification: jest.fn(),
    goToNext: jest.fn(),
    isRequested: false,
    isVerified: false,
    isPending: false,
} as unknown as UseEmailOnboardingHookResult

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationForwardingSetupForm />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with the appropriate fields', () => {
        renderComponent()

        expect(
            screen.getByText('Forward customer emails to Gorgias'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Route all of your incoming customer emails from your email provider to your Gorgias inbox. Configuring email forwarding improves the deliverability and trustworthiness of your emails.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('<BaseEmailIntegrationInputField />'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('EmailForwardingInstructions'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('EmailIntegrationOnboardingButtons'),
        ).toBeInTheDocument()
    })

    it('should show checkbox when not requested, not pending, and not verified', () => {
        renderComponent()

        expect(
            screen.getByRole('checkbox', {
                name: /I confirm that I have set up email forwarding/,
            }),
        ).toBeInTheDocument()
    })

    it('should call sendVerification when checkbox is clicked', () => {
        renderComponent()

        const checkbox = screen.getByRole('checkbox', {
            name: /I confirm that I have set up email forwarding/,
        })

        fireEvent.click(checkbox)

        expect(defaultHookResult.sendVerification).toHaveBeenCalled()
    })

    it('should show loading state when requested and pending', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
            isPending: true,
            isVerified: false,
        })

        renderComponent()

        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(
            screen.queryByRole('checkbox', {
                name: /I confirm that I have set up email forwarding/,
            }),
        ).not.toBeInTheDocument()
    })

    it('should show success state when verified', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
            isPending: false,
            isVerified: true,
        })

        renderComponent()

        expect(screen.getByText('check')).toBeInTheDocument()
        expect(
            screen.queryByRole('checkbox', {
                name: /I confirm that I have set up email forwarding/,
            }),
        ).not.toBeInTheDocument()
    })

    it('should show error state when requested but not pending and not verified', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
            isPending: false,
            isVerified: false,
        })

        renderComponent()

        expect(screen.getByText('error_outline')).toBeInTheDocument()
        expect(
            screen.queryByRole('checkbox', {
                name: /I confirm that I have set up email forwarding/,
            }),
        ).not.toBeInTheDocument()
    })

    it('should call sendVerification on form submit when not requested', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: false,
            isPending: false,
            isVerified: false,
        })

        renderComponent()

        const checkbox = screen.getByRole('checkbox', {
            name: /I confirm that I have set up email forwarding/,
        })

        fireEvent.click(checkbox)

        expect(defaultHookResult.sendVerification).toHaveBeenCalled()
        expect(defaultHookResult.goToNext).not.toHaveBeenCalled()
    })

    it('should call goToNext on form submit when already requested', async () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
        })

        renderComponent()

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.goToNext).toHaveBeenCalled()
            expect(defaultHookResult.sendVerification).not.toHaveBeenCalled()
        })
    })
})
