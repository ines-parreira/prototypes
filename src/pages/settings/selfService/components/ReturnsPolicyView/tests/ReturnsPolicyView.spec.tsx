import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useParams} from 'react-router-dom'

import {
    SelfServiceConfiguration,
    ShopType,
} from 'models/selfServiceConfiguration/types'
import {SelfServiceConfigurationsState} from 'state/entities/selfServiceConfigurations/types'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {automationPriceFeatures} from 'fixtures/productPrices'
import {automationSubscriptionProductPrices} from 'fixtures/account'
import {entitiesInitialState} from 'fixtures/entities'
import {ReturnsPolicyView} from '../ReturnsPolicyView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

jest.mock('models/selfServiceConfiguration/resources')
jest.mock('react-router')

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `myStore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (
    length: number
): SelfServiceConfiguration[] => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `myStore${i + 1}`,
        created_datetime: '2021-01-26T00:29:00Z',
        updated_datetime: '2021-01-26T00:29:30Z',
        deactivated_datetime: i % 2 === 0 ? null : '2021-01-26T00:30:00Z',
        // track_order && return_order policies enabled for mystore1 and mystore3
        // report_issue && cancel_order policies enabled for mystore2 and mystore4
        report_issue_policy: {
            enabled: i % 2 !== 0,
            cases: [],
        },
        track_order_policy: {
            enabled: i % 2 === 0,
        },
        cancel_order_policy: {
            enabled: i % 2 !== 0,
            eligibilities: [],
            exceptions: [],
        },
        return_order_policy: {
            enabled: i % 2 === 0,
            eligibilities: [
                {
                    key: 'order_created_at',
                    value: '15',
                    operator: 'lt',
                },
            ],
            exceptions: [],
        },
        quick_response_policies: [],
    }))
}

describe('<ReturnsPolicyView />', () => {
    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS({
            current_subscription: {
                products: automationSubscriptionProductPrices,
            },
            features: automationPriceFeatures,
            created_datetime: '2021-08-01T00:00:00Z',
        }),
        entities: entitiesInitialState,
        integrations: fromJS({}),
    }

    describe('render()', () => {
        it('should render the select field', () => {
            useParamsMock.mockReturnValue({
                shopName: 'myStore1',
                integrationType: 'shopify',
            })

            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        entities: {
                            ...defaultState.entities,
                            selfServiceConfigurations:
                                selfServiceConfigurations.reduce(
                                    (
                                        configurations: SelfServiceConfigurationsState,
                                        configuration: SelfServiceConfiguration
                                    ) => ({
                                        ...configurations,
                                        [configuration.id]: configuration,
                                    }),
                                    {} as Partial<SelfServiceConfiguration>
                                ),
                        },
                    })}
                >
                    <ReturnsPolicyView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
