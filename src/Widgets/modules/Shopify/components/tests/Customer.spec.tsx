import React, {useContext} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore, {MockStore} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {initialState} from 'state/infobarActions/shopify/createOrder/reducers'
import {IntegrationType} from 'models/integration/constants'
import {assumeMock} from 'utils/testing'

import {ShopifyContext} from '../../contexts/ShopifyContext'
import {getShopifyResourceIds} from '../../helpers/getShopifyResourceIds'

import {customerCustomization} from '../Customer'

jest.mock('../../helpers/getShopifyResourceIds')
const getShopifyResourceIdsMock = assumeMock(getShopifyResourceIds)

const AfterTitle = customerCustomization.AfterTitle!
const Wrapper = customerCustomization.Wrapper!

describe('Wrapper', () => {
    const spiedDataFunction = jest.fn()
    it('should provide a context', () => {
        const contextValue = {
            data_source: 'Customer',
            widget_resource_ids: {
                target_id: 4,
                customer_id: null,
            },
        }
        getShopifyResourceIdsMock.mockReturnValue(
            contextValue.widget_resource_ids
        )
        const Child = () => {
            const data = useContext(ShopifyContext)
            spiedDataFunction(data)
            return <></>
        }
        render(
            <Wrapper source={fromJS({})}>
                <Child />
            </Wrapper>
        )

        expect(spiedDataFunction).toHaveBeenCalledWith(contextValue)
    })
})

describe('<AfterTitle/>', () => {
    let store: MockStore
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
