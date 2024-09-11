import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {renderHook} from '@testing-library/react-hooks'

import {EmailIntegration} from 'models/integration/types'

import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookOptions,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

const render = (options?: UseEmailOnboardingHookOptions, path?: string) => {
    return renderHook(() => useEmailOnboarding(options), {
        wrapper: ({children}) => (
            <MemoryRouter initialEntries={[path ?? '/']}>
                {children}
            </MemoryRouter>
        ),
    })
}

describe('useDomainVerification()', () => {
    it('should have an initial state', () => {
        const {result} = render()
        expect(result.current.integration).toEqual(undefined)
        expect(result.current.isConnected).toEqual(false)
        expect(result.current.isVerifying).toEqual(false)
        expect(result.current.isVerified).toEqual(false)
        expect(result.current.currentStep).toEqual(
            EmailIntegrationOnboardingStep.ConnectIntegration
        )
        expect(typeof result.current.connectIntegration).toEqual('function')
        expect(typeof result.current.sendVerification).toEqual('function')
        expect(typeof result.current.deleteIntegration).toEqual('function')
    })

    describe('current step', () => {
        it('should return ConnectIntegration when no integration is provided', () => {
            const {result} = render()
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.ConnectIntegration
            )
        })

        it('should return ForwardingSetup when the integration has not been verified', () => {
            const integration = {
                id: 1,
                meta: {
                    verified: false,
                },
            } as EmailIntegration
            const {result} = render({integration})
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.ForwardingSetup
            )
        })

        it('should return Verification when the integration has been verified', () => {
            const integration = {
                meta: {
                    verified: true,
                },
            } as EmailIntegration
            const {result} = render({integration})
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.Verification
            )
        })

        describe('with URL overrides', () => {
            const integration = {
                id: 1,
                meta: {
                    verified: true,
                    email_forwarding_activated: true,
                },
            } as EmailIntegration

            it('should return ForwardingSetup when the the URL is set to forwarding', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/forwarding-setup'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ForwardingSetup
                )
            })

            it('should return ConnectIntegration when the URL is set to connect', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/connect-integration'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ConnectIntegration
                )
            })

            it('should return Verification when the URL is set to verification', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/verification'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.Verification
                )
            })

            it('should return ForwardingSetup when the URL is set to verification, if forwarding has not been enabled yet', () => {
                const {result} = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: true,
                                email_forwarding_activated: false,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/verification'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ForwardingSetup
                )
            })
        })
    })
})
