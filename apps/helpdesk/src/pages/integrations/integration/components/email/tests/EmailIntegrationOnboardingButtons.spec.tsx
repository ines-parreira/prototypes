import type React from 'react'

import { useLocalStorage } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'

import EmailIntegrationOnboardingButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons'
import type { UseEmailOnboardingHookResult } from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'

const FormContext = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<{ test: string }>()
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderComponent = (props = {}) =>
    render(<EmailIntegrationOnboardingButtons {...props} />, {
        wrapper: FormContext,
    })

jest.mock(
    'pages/integrations/integration/components/email/hooks/useEmailOnboarding',
)
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
jest.mock(
    'pages/integrations/integration/components/email/CustomerOnboarding/OnboardingDomainVerificationButtons',
    () => () => <div>OnboardingDomainVerificationButtons</div>,
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

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
const useLocalStorageMock = assumeMock(useLocalStorage)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationOnboardingButtons />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useLocalStorageMock.mockReturnValue([null, jest.fn(), jest.fn()])
    })

    describe('back/cancel', () => {
        it('should render a cancel button if the current step is connect', () => {
            const cancelCallback = jest.fn()

            useEmailOnboardingMock.mockReturnValue({
                ...defaultHookResult,
                currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
            })

            renderComponent({ cancelCallback })

            const button = screen.getByRole('button', {
                name: 'Cancel',
            })
            expect(button).toBeInTheDocument()

            fireEvent.click(button)

            expect(cancelCallback).toHaveBeenCalled()
        })

        it('should render a back button if the current step is NOT connect', () => {
            useEmailOnboardingMock.mockReturnValue({
                ...defaultHookResult,
                currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
            })

            renderComponent()

            const button = screen.getByRole('button', {
                name: 'Back',
            })
            expect(button).toBeInTheDocument()

            fireEvent.click(button)

            expect(defaultHookResult.goBack).toHaveBeenCalled()
        })
    })

    describe('next/CTA', () => {
        describe('Connect Integration step', () => {
            it('should render a Next CTA (not disabled by default)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                    isConnected: false,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Next',
                })
                expect(button).toBeInTheDocument()
                expect(button).not.toBeDisabled()
            })

            it('should render a Next CTA (not disabled if already connected)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                    isConnected: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Next',
                })
                expect(button).toBeInTheDocument()
                expect(button).toBeEnabled()
                expect(button.getAttribute('type')).toBe('submit')
            })

            it('should track loading state', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                    isConnecting: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Loading... Next',
                })
                expect(button).toBeInTheDocument()
            })
        })

        describe('Setup Forwarding step', () => {
            it('should render a Next CTA (disabled by default)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Next',
                })
                expect(button).toBeInTheDocument()
                expect(button).toHaveAttribute('aria-disabled', 'true')
            })

            it('should render a Next CTA (enabled if verified)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
                    isVerified: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Next',
                })
                expect(button).toBeInTheDocument()
                expect(button).toBeEnabled()
            })

            it('should render "Send test email again" if verification has failed', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
                    isRequested: true,
                    isPending: false,
                    isVerified: false,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Send test email again',
                })
                expect(button).toBeInTheDocument()
            })

            it('should track loading state', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.SetupForwarding,
                    isSending: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Loading... Next',
                })
                expect(button).toBeInTheDocument()
            })
        })

        describe('Domain Verification step', () => {
            it('should display the domain verification buttons when on the domain verification step', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.DomainVerification,
                    integration: { id: 1 } as EmailIntegration,
                })

                renderComponent()

                expect(
                    screen.getByText('OnboardingDomainVerificationButtons'),
                ).toBeInTheDocument()
            })

            it('should not display domain verification buttons if no integration', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.DomainVerification,
                    integration: undefined,
                })

                renderComponent()

                expect(
                    screen.queryByText('OnboardingDomainVerificationButtons'),
                ).not.toBeInTheDocument()
            })
        })
    })
})
