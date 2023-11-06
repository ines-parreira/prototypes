import React from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'

import {IntegrationType} from 'models/integration/constants'
import {billingState} from 'fixtures/billing'
import withStoreIntegrations from '../../utils/withStoreIntegrations'

const AnyComponent = () => (
    <div data-testid="aao-component">Just a component...</div>
)

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

    it('should not render the passed component when the integeration is not available', () => {
        const AaoComponent = withStoreIntegrations('Hello', AnyComponent)
        const {container, queryByTestId, getByText} = render(
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
            </Provider>
        )
        expect(queryByTestId('aao-component')).not.toBeInTheDocument()
        expect(getByText('Hello')).toBeInTheDocument()
        expect(container).toMatchSnapshot()
    })
    it('should render the passed component when the integeration is available', () => {
        const AaoComponent = withStoreIntegrations('Hello', AnyComponent)
        const {container, getByTestId} = render(
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
            </Provider>
        )
        expect(getByTestId('aao-component')).toBeInTheDocument()

        expect(container).toMatchSnapshot()
    })
})
