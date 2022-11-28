import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import React from 'react'
import {merge} from 'lodash'
import {Provider} from 'react-redux'
import createMockStore from 'redux-mock-store'
import {integrationsState} from 'fixtures/integrations'
import {
    EmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    SenderVerification,
    VerificationStatus,
} from 'models/singleSenderVerification/types'
import {entitiesInitialState} from 'fixtures/entities'
import {
    getVerification,
    deleteVerification,
} from 'models/singleSenderVerification/resources'
import SingleSenderVerification, {
    Props,
} from '../SingleSenderVerification/SingleSenderVerification'

jest.mock('models/singleSenderVerification/resources')

const mockStore = createMockStore<RootState, StoreDispatch>()

const emailAddress = 'sendgrid@gorgias.io'

const integration = integrationsState.integrations.find(
    (integration) => integration.meta.address === emailAddress
) as unknown as EmailIntegration

const mockVerification: Partial<SenderVerification> = {
    address: 'Mock Address',
    email: emailAddress,
    city: 'San Francisco',
    country: 'United States',
}

describe('SingleSenderVerification', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderComponent = (
        props?: Partial<Props>,
        singleSenderState = {}
    ) => {
        cleanup()
        return render(
            <Provider
                store={mockStore({
                    entities: {
                        ...entitiesInitialState,
                        singleSenderVerifications: singleSenderState,
                    },
                } as any)}
            >
                <SingleSenderVerification
                    baseURL={'SingleSenderVerificationMockUrl'}
                    integration={integration}
                    {...props}
                />
            </Provider>
        )
    }

    it('Should not fetch verification when no verification was created', () => {
        renderComponent({
            integration: merge(integration, {
                meta: {
                    outbound_verification_status: {
                        single_sender:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            }),
        })

        expect(getVerification).not.toHaveBeenCalled()
    })

    it('Should display "Create verification step" when no verification is created', async () => {
        renderComponent({
            integration: merge(integration, {
                meta: {
                    outbound_verification_status: {
                        single_sender:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            }),
        })

        expect(
            await screen.findByTestId('create-verification-step')
        ).toBeTruthy()
        expect(screen.queryByTestId('verification-email-sent-step')).toBeFalsy()
        expect(screen.queryByTestId('verification-confirmed-step')).toBeFalsy()
    })

    it.each([
        OutboundVerificationStatusValue.Pending,
        OutboundVerificationStatusValue.Failure,
    ])(
        'Should display "Verification email sent step" when verification is created but not confirmed',
        async (status) => {
            renderComponent(
                {
                    integration: merge(integration, {
                        meta: {
                            outbound_verification_status: {
                                single_sender: status,
                            },
                        },
                    }),
                },
                {
                    12: {
                        ...mockVerification,
                        status: VerificationStatus.EmailSent,
                    },
                }
            )

            expect(
                await screen.findByTestId('verification-email-sent-step')
            ).toBeTruthy()
            expect(screen.queryByTestId('create-verification-step')).toBeFalsy()
            expect(
                screen.queryByTestId('verification-confirmed-step')
            ).toBeFalsy()
        }
    )

    it('Should display "Verification confirmed" step when the verification is confirmed', async () => {
        renderComponent(
            {
                integration: merge(integration, {
                    meta: {
                        outbound_verification_status: {
                            single_sender:
                                OutboundVerificationStatusValue.Success,
                        },
                    },
                }),
            },
            {
                12: {
                    ...mockVerification,
                    status: VerificationStatus.Verified,
                },
            }
        )

        expect(
            await screen.findByTestId('verification-confirmed-step')
        ).toBeTruthy()
        expect(screen.queryByTestId('create-verification-step')).toBeFalsy()
        expect(screen.queryByTestId('verification-email-sent-step')).toBeFalsy()
    })

    it.each([
        OutboundVerificationStatusValue.Pending,
        OutboundVerificationStatusValue.Failure,
        OutboundVerificationStatusValue.Success,
    ])(
        'Should fetch verification when verification is created',
        async (status) => {
            renderComponent({
                integration: merge(integration, {
                    meta: {
                        outbound_verification_status: {
                            single_sender: status,
                        },
                    },
                }),
            })

            await waitFor(() => {
                expect(getVerification).toHaveBeenCalled()
            })
        }
    )

    it('Should call "delete verification" endpoint', async () => {
        renderComponent(
            {
                integration: merge(integration, {
                    meta: {
                        outbound_verification_status: {
                            single_sender:
                                OutboundVerificationStatusValue.Success,
                        },
                    },
                }),
            },
            {
                12: {
                    ...mockVerification,
                    status: VerificationStatus.Verified,
                },
            }
        )

        fireEvent.click(
            await screen.findByRole('button', {
                name: /delete delete verification/i,
            })
        )
        const tooltip = screen.getByRole('tooltip')

        fireEvent.click(
            within(tooltip).getByRole('button', {
                name: /confirm/i,
            })
        )

        await waitFor(() => expect(deleteVerification).toHaveBeenCalled())
    })
})
