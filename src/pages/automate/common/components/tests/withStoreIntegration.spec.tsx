import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import withStoreIntegrations from 'pages/automate/common/utils/withStoreIntegrations'
import { RootState, StoreDispatch } from 'state/types'

const AnyComponent = () => <div>Just a component...</div>

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('withStoreIntegrations', () => {
    function getIntegration(id: number, type: IntegrationType) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                phone_number_id: id,
            },
        }
    }

    it('should not render the passed component when the integration is not available', () => {
        const AaoComponent = withStoreIntegrations('Hello', AnyComponent)
        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),

                    integrations: fromJS({
                        integrations: [
                            getIntegration(1, IntegrationType.Sms),
                            getIntegration(2, IntegrationType.Sms),
                        ],
                    }),
                })}
            >
                <AaoComponent />
            </Provider>,
        )
        expect(
            screen.queryByText(/Just a component.../),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Hello')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Connect Shopify, Magento or BigCommerce stores to start using Automate!',
            ),
        ).toBeInTheDocument()
    })

    it('should render the passed component when the integration is available', () => {
        const AaoComponent = withStoreIntegrations('Hello', AnyComponent)
        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [
                            getIntegration(1, IntegrationType.Shopify),
                            getIntegration(2, IntegrationType.Sms),
                        ],
                    }),
                })}
            >
                <AaoComponent />
            </Provider>,
        )
        expect(screen.getByText(/Just a component.../)).toBeInTheDocument()
    })
})
