import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {
    SelfServiceConfiguration,
    ShopType,
} from 'models/selfServiceConfiguration/types'
import {RootState, StoreDispatch} from 'state/types'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfigurationsState} from 'state/entities/selfServiceConfigurations/types'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {automationPriceFeatures} from 'fixtures/productPrices'
import {SelfServiceView} from '../SelfServiceView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const fetchSelfServiceConfigurationsMock =
    fetchSelfServiceConfigurations as jest.MockedFunction<
        typeof fetchSelfServiceConfigurations
    >

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)
jest.mock('models/selfServiceConfiguration/resources')

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `mystore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `mystore${i + 1}`,
        created_datetime: '2021-01-26T00:29:00Z',
        updated_datetime: '2021-01-26T00:29:30Z',
        deactivated_datetime: i % 2 === 0 ? null : '2021-01-26T00:30:00Z',
        report_issue_policy: {
            enabled: false,
            cases: [],
        },
        track_order_policy: {
            enabled: false,
        },
        cancel_order_policy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        return_order_policy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        quick_response_policies: [],
    }))
}

describe('<SelfServiceView/>', () => {
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS({
            ...account,
            features: automationPriceFeatures,
            created_datetime: '2021-08-01T00:00:00Z',
        }),
        entities: {
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenter: helpCenterInitialState,
            helpCenterArticles: {},
            selfServiceConfigurations: {},
            phoneNumbers: {},
            auditLogEvents: {},
        },
        integrations: fromJS({}),
    }

    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(Date.prototype, 'toISOString').mockImplementation(
            () => '2021-01-26T00:30:00Z'
        )
    })

    describe('render()', () => {
        it('should render the default message when there is no active shopify integration', () => {
            fetchSelfServiceConfigurationsMock.mockImplementationOnce(() => {
                return Promise.resolve({
                    data: [],
                })
            })

            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                    })}
                >
                    <SelfServiceView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should render a row for each shopify integration, 2 active and 1 inactive ssp services', async () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(3)
            const selfServiceConfigurations =
                createSelfServiceConfigurationFixtures(3)

            fetchSelfServiceConfigurationsMock.mockImplementationOnce(() => {
                return Promise.resolve({
                    data: selfServiceConfigurations,
                })
            })

            const {container, findByTestId} = render(
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
                    <SelfServiceView />
                </Provider>
            )

            await findByTestId('table-integrations')
            expect(container).toMatchSnapshot()
        })
    })
})
