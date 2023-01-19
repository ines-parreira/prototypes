import {cleanup, render, screen, within} from '@testing-library/react'
import React from 'react'
import {merge} from 'lodash'
import {Provider} from 'react-redux'
import {integrationsState} from 'fixtures/integrations'
import {
    EmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {mockStore} from 'utils/testing'
import EmailVerification, {Props} from '../EmailVerification'

const integration = integrationsState.integrations.find(
    (integration) => integration.meta.address === 'sendgrid@gorgias.io'
) as unknown as EmailIntegration

describe('EmailVerification', () => {
    const renderComponent = (props?: Partial<Props>, store = {}) => {
        cleanup()

        return render(
            <Provider store={mockStore(store as any)}>
                <EmailVerification
                    baseURL={'emailVerificationMockUrl'}
                    loading={false}
                    integration={integration}
                    {...props}
                />
            </Provider>
        )
    }

    it('should display both Domain Verification and Single Sender Verification cards', () => {
        renderComponent()

        expect(screen.getByText('Domain Verification')).toBeTruthy()
        expect(screen.getByText('Single Sender Verification')).toBeTruthy()
    })

    it('should hide "Verify" buttons when integration is base email', () => {
        window.GORGIAS_STATE = {
            integrations: {
                authentication: {
                    email: {
                        forwarding_email_address: 'gorgias.com',
                    },
                },
            },
        } as any

        renderComponent({
            integration: merge(integration, {
                is_base_email_integration: true,
                meta: {
                    address: 'email@gorgias.com',
                    outbound_verification_status: {
                        domain: OutboundVerificationStatusValue.Unverified,
                        single_sender:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            }),
        })

        expect(
            screen.queryByRole('button', {
                name: /verify domain/i,
            })
        ).toBeFalsy()
        expect(
            screen.queryByRole('button', {
                name: /verify single sender/i,
            })
        ).toBeFalsy()
    })

    describe('Domain Verification', () => {
        it('should display Domain Verification as unverified', () => {
            renderComponent({
                integration: merge(integration, {
                    is_base_email_integration: false,
                    meta: {
                        address: 'sendgridAddress@email.com',
                        outbound_verification_status: {
                            domain: OutboundVerificationStatusValue.Unverified,
                        },
                    },
                }),
            })
            expect(
                screen.getAllByTestId('verification-status-value')[0].innerHTML
            ).toBe('Not verified')
            expect(
                screen.getByRole('button', {
                    name: /verify domain/i,
                })
            ).toBeTruthy()
        })

        it('should display Domain Verification as verified', () => {
            renderComponent({
                integration: merge(integration, {
                    is_base_email_integration: false,
                    meta: {
                        address: 'sendgridAddress@email.com',
                        outbound_verification_status: {
                            domain: OutboundVerificationStatusValue.Success,
                        },
                    },
                }),
            })

            expect(
                screen.getAllByTestId('verification-status-value')[0].innerHTML
            ).toBe('Verified')
            expect(
                screen.queryByRole('button', {
                    name: /verify domain/i,
                })
            ).toBeFalsy()
        })

        it.each([
            OutboundVerificationStatusValue.Unverified,
            OutboundVerificationStatusValue.Pending,
            OutboundVerificationStatusValue.Failure,
        ])(
            'should not display verification status when Single Sender is not verified and Domain is verified',
            (singleSenderStatus) => {
                renderComponent({
                    integration: merge(integration, {
                        is_base_email_integration: false,
                        meta: {
                            address: 'sendgridAddress@email.com',
                            outbound_verification_status: {
                                single_sender: singleSenderStatus,
                                domain: OutboundVerificationStatusValue.Success,
                            },
                        },
                    }),
                })

                const singleSenderCard = screen.queryAllByTestId(
                    'verification-status-footer'
                )[1]
                const status = within(singleSenderCard).queryByTestId(
                    'verification-status-value'
                )

                expect(status).toBeFalsy()
                expect(
                    screen
                        .getByText(/verify single sender/i)
                        .hasAttribute('disabled')
                ).toBeTruthy()
            }
        )
    })

    describe('Single Sender', () => {
        it('should display Single Sender Verification as verified', () => {
            renderComponent({
                integration: merge(integration, {
                    is_base_email_integration: false,
                    meta: {
                        address: 'sendgridAddress@email.com',
                        outbound_verification_status: {
                            domain: OutboundVerificationStatusValue.Unverified,
                            single_sender:
                                OutboundVerificationStatusValue.Success,
                        },
                    },
                }),
            })

            expect(
                screen.getAllByTestId('verification-status-value')[1].innerHTML
            ).toBe('Verified')
            expect(
                screen.queryByRole('button', {
                    name: /verify single sender/i,
                })
            ).toBeFalsy()
        })

        it.each([
            OutboundVerificationStatusValue.Failure,
            OutboundVerificationStatusValue.Unverified,
        ])(
            'should display Single Sender Verification as unverified',
            (status) => {
                renderComponent({
                    integration: merge(integration, {
                        is_base_email_integration: false,
                        meta: {
                            address: 'sendgridAddress@email.com',
                            outbound_verification_status: {
                                single_sender: status,
                            },
                        },
                    }),
                })
                expect(
                    screen.getAllByTestId('verification-status-value')[1]
                        .innerHTML
                ).toBe('Not verified')
                expect(
                    screen.getByRole('button', {
                        name: /verify single sender/i,
                    })
                ).toBeTruthy()
            }
        )
    })
})
