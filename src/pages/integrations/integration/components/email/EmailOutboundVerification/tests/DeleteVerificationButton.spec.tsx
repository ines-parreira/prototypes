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
import {deleteVerification} from 'models/singleSenderVerification/resources'
import DeleteVerificationButton from '../DeleteVerificationButton'

jest.mock('models/singleSenderVerification/resources')

const mockStore = createMockStore<RootState, StoreDispatch>()

const emailAddress = 'sendgrid@gorgias.io'

const integration = integrationsState.integrations.find(
    (integration) => integration.meta.address === emailAddress
) as unknown as EmailIntegration

const mockVerification = {
    address: 'Mock Address',
    email: emailAddress,
    city: 'San Francisco',
    country: 'United States',
    integration_id: integration.id,
}

describe('DeleteVerificationButton', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const onConfirm = jest.fn()

    const renderComponent = (
        props?: Partial<typeof DeleteVerificationButton>,
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
                <DeleteVerificationButton
                    verification={mockVerification as SenderVerification}
                    {...props}
                />
            </Provider>
        )
    }

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
                onConfirm,
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

        await waitFor(() =>
            expect(deleteVerification).toHaveBeenCalledWith(integration.id)
        )
        expect(onConfirm).toHaveBeenCalled()
    })
})
