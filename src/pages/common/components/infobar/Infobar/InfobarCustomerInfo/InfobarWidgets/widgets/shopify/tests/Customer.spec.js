import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Customer from '../Customer'
import {IntegrationContext} from '../../IntegrationContext'
import {IntegrationType} from '../../../../../../../../../../models/integration/constants'
import {initialState} from '../../../../../../../../../../state/infobarActions/shopify/createOrder/reducers'

const AfterTitle = Customer().AfterTitle

describe('<TitleWrapper/>', () => {
    let store
    const mockStore = configureMockStore([thunk])

    const integrationId = 1
    const integration = {
        id: integrationId,
        name: 'My Shopify Integration',
        total_spent: '100.0',
        currency: 'USD',
        admin_graphql_api_id: 'https://test.myshopify.com',
        meta: {
            currency: 'GBP',
            store_url: 'https://test.myshopify.com',
        },
        integrationType: IntegrationType.Shopify,
        shopify: IntegrationType.Shopify,
    }

    beforeEach(() => {
        jest.resetAllMocks()

        store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
            infobarActions: {
                [IntegrationType.Shopify]: {
                    createOrder: initialState,
                },
            },
        })
    })

    it('should match snapshot', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS(integration),
                        integrationId: integrationId,
                    }}
                >
                    <AfterTitle source={fromJS(integration)} />
                </IntegrationContext.Provider>
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should display GBP(£) as store currency, not USD', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS(integration),
                        integrationId: integrationId,
                    }}
                >
                    <AfterTitle source={fromJS(integration)} />
                </IntegrationContext.Provider>
            </Provider>
        )
        expect(container.textContent).toContain('Total spent: £100.00')
    })
})
