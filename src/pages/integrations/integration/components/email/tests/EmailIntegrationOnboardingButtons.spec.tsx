import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import useLocalStorage from 'hooks/useLocalStorage'
import EmailIntegrationOnboardingButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
    UseEmailOnboardingHookResult,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'
import { assumeMock } from 'utils/testing'

const FormContext = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<{ test: string }>()
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderComponent = () =>
    render(<EmailIntegrationOnboardingButtons />, {
        wrapper: FormContext,
    })

jest.mock(
    'pages/integrations/integration/components/email/hooks/useEmailOnboarding',
)
jest.mock('hooks/useLocalStorage')
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
            useEmailOnboardingMock.mockReturnValue({
                ...defaultHookResult,
                currentStep: EmailIntegrationOnboardingStep.ConnectIntegration,
            })

            renderComponent()

            const button = screen.getByRole('button', {
                name: 'Cancel',
            })
            expect(button).toBeInTheDocument()

            fireEvent.click(button)

            expect(defaultHookResult.goBack).toHaveBeenCalled()
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
            it('should render a Next CTA (disabled by default)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep:
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Next',
                })
                expect(button).toBeInTheDocument()
                expect(button).toBeAriaDisabled()
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
                expect(button).toBeAriaEnabled()
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
                expect(button).toBeAriaDisabled()
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
                expect(button).toBeAriaEnabled()
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

    it('should show the delete integration button if the integration exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: { id: 1 } as EmailIntegration,
        })

        renderComponent()

        expect(
            screen.getByRole('button', {
                name: 'Delete integration',
            }),
        ).toBeInTheDocument()
    })

    it('should not show the delete integration button if no integration exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: undefined,
        })

        renderComponent()

        expect(
            screen.queryByRole('button', {
                name: 'Delete integration',
            }),
        ).not.toBeInTheDocument()
    })

    it('should call removeVerification and deleteIntegration when delete is confirmed', () => {
        const removeVerificationMock = jest.fn()
        const deleteIntegrationMock = jest.fn()

        useLocalStorageMock.mockReturnValue([
            null,
            jest.fn(),
            removeVerificationMock,
        ])
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: { id: 1 } as EmailIntegration,
            deleteIntegration: deleteIntegrationMock,
        })

        renderComponent()

        const deleteButton = screen.getByRole('button', {
            name: 'Delete integration',
        })

        fireEvent.click(deleteButton)

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })
        fireEvent.click(confirmButton)

        expect(removeVerificationMock).toHaveBeenCalled()
        expect(deleteIntegrationMock).toHaveBeenCalled()
    })
})
