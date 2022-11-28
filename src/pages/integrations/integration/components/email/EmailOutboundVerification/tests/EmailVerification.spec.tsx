import {cleanup, render, screen} from '@testing-library/react'
import React from 'react'
import {merge} from 'lodash'
import {Provider} from 'react-redux'
import createMockStore from 'redux-mock-store'
import {integrationsState} from 'fixtures/integrations'
import {EmailIntegration} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'
import EmailVerification, {Props} from '../EmailVerification'

const mockStore = createMockStore<RootState, StoreDispatch>()
const store = mockStore({} as RootState)

const integration = integrationsState.integrations.find(
    (integration) => integration.meta.address === 'sendgrid@gorgias.io'
) as unknown as EmailIntegration

describe('EmailVerification', () => {
    const renderComponent = (props?: Partial<Props>) => {
        cleanup()
        return render(
            <Provider store={store}>
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

    it('should display Single Sender Verification as verified', () => {
        renderComponent({
            integration: merge(integration, {
                meta: {
                    outbound_verification_status: {
                        single_sender: 'success',
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

    it.each(['failure', 'unverified'])(
        'should display Single Sender Verification as unverified',
        (status) => {
            renderComponent({
                integration: merge(integration, {
                    meta: {
                        outbound_verification_status: {
                            single_sender: status,
                        },
                    },
                }),
            })
            expect(
                screen.getAllByTestId('verification-status-value')[1].innerHTML
            ).toBe('Not verified')
            expect(
                screen.getByRole('button', {
                    name: /verify single sender/i,
                })
            ).toBeTruthy()
        }
    )
})
