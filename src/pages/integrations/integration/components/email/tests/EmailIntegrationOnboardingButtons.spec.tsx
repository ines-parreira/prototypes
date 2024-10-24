import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {FormProvider, useForm} from 'react-hook-form'

import {EmailIntegration} from 'models/integration/types/email'
import {assumeMock} from 'utils/testing'

import EmailIntegrationOnboardingButtons from '../EmailIntegrationOnboardingButtons'
import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

const FormContext = ({children}: {children: React.ReactNode}) => {
    const methods = useForm<{test: string}>()
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderComponent = () =>
    render(<EmailIntegrationOnboardingButtons />, {
        wrapper: FormContext,
    })

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

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationOnboardingButtons />', () => {
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

        it('should render a next button if the current step is NOT connect', () => {
            useEmailOnboardingMock.mockReturnValue({
                ...defaultHookResult,
                currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
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
                expect(button.getAttribute('type')).toBe('submit')
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
                expect(button.getAttribute('type')).toBe('submit')
            })
        })

        describe('Forwarding Setup step', () => {
            it('should render a Begin Verification CTA (disabled by default)', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Begin Verification',
                })
                expect(button).toBeInTheDocument()
                expect(button).toBeAriaDisabled()
                expect(button.getAttribute('type')).toBe('submit')
            })

            it('should render a Next CTA if already requested', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
                    isRequested: true,
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
                    currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
                    isSending: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Loading... Begin Verification',
                })
                expect(button).toBeInTheDocument()
                expect(button.getAttribute('type')).toBe('submit')
            })
        })

        describe('Verification step', () => {
            it('should render a Begin Verification CTA', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.Verification,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Begin Verification',
                })
                expect(button).toBeInTheDocument()
                expect(button.getAttribute('type')).toBe('submit')
            })

            it('should render as Re-Send Verification CTA once requested', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.Verification,
                    isRequested: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'markunread Re-Send Verification Email',
                })
                expect(button).toBeInTheDocument()
                expect(button.getAttribute('type')).toBe('submit')
            })

            it('should track loading state', () => {
                useEmailOnboardingMock.mockReturnValue({
                    ...defaultHookResult,
                    currentStep: EmailIntegrationOnboardingStep.Verification,
                    isSending: true,
                })

                renderComponent()

                const button = screen.getByRole('button', {
                    name: 'Loading... Begin Verification',
                })
                expect(button).toBeInTheDocument()
                expect(button.getAttribute('type')).toBe('submit')
            })
        })
    })

    it('should show the delete integration button if the integration exists', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            integration: {id: 1} as EmailIntegration,
        })

        renderComponent()

        expect(
            screen.getByRole('button', {
                name: 'delete Delete Email Address',
            })
        ).toBeInTheDocument()
    })
})
