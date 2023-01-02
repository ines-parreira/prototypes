import React from 'react'
import {fromJS} from 'immutable'
import {screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import LD from 'launchdarkly-react-client-sdk'
import {renderWithRouter} from 'utils/testing'

import {INTEGRATION_TYPE_CONFIG} from 'config'
import {dummyAppListData} from 'fixtures/apps'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import {IntegrationListItem} from 'state/integrations/types'
import {Integration} from 'models/integration/types'
import client from 'models/api/resources'
import {IntegrationType} from 'models/integration/constants'
import {HelpdeskPrice, PlanInterval, ProductType} from 'models/billing/types'

import {CATEGORY_URL_PARAM, SEARCH_URL_PARAM} from '../constants'
import All, {addRequiredPlanToIntegrations} from '../All'
import {CARD_LINK_ID, LOADING_TEST_ID} from '../Card'

const mockStore = configureMockStore([thunk])

const HELPDESK_PRODUCT_ID = 'hepdeskpid'
const INTEGRATIONS_PRICE_ID = '3'
const store = mockStore({
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: INTEGRATIONS_PRICE_ID,
            },
        },
    }),
    billing: fromJS({
        products: [
            {
                type: ProductType.Helpdesk,
                id: HELPDESK_PRODUCT_ID,
                prices: [
                    {
                        price_id: INTEGRATIONS_PRICE_ID,
                        integrations: 150,
                        amount: 100,
                    },
                ],
            },
            {
                type: ProductType.Automation,
                id: 'don’t care',
                prices: [{amount: 100}],
            },
        ],
    }),
    integrations: fromJS({
        integrations: Array.from({length: 5}, (_, index) => ({id: index})),
    }),
})

const prices = [
    {
        price_id: INTEGRATIONS_PRICE_ID,
        integrations: 150,
        interval: PlanInterval.Month,
        amount: 100,
        name: 'FeatureName',
        features: {
            [AccountFeature.MagentoIntegration]: {
                enabled: true,
            } as AccountFeatureMetadata,
        },
    } as HelpdeskPrice,
]

describe('addRequiredPlanToIntegrations()', () => {
    it('should return the "Enterprise" plan for twitter', () => {
        const twitterConf = INTEGRATION_TYPE_CONFIG.find(
            (conf) => conf.type === IntegrationType.Twitter
        )
        expect(
            addRequiredPlanToIntegrations(
                [twitterConf as unknown as IntegrationListItem],
                [{} as Integration],
                {
                    [AccountFeature.MagentoIntegration]: {
                        enabled: false,
                    } as AccountFeatureMetadata,
                },
                prices
            )[0].requiredPriceName
        ).toBe('Enterprise')
    })

    it('should return the required plan', () => {
        const magentoConf = INTEGRATION_TYPE_CONFIG.find(
            (conf) => conf.type === IntegrationType.Magento2
        )
        expect(
            addRequiredPlanToIntegrations(
                [magentoConf as unknown as IntegrationListItem],
                [{} as Integration],
                {},
                prices
            )[0].requiredPriceName
        ).toBe(prices[0].name)
    })
})

describe('<All />', () => {
    const mockApi = new MockAdapter(client)
    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.AppStore]: true,
    }))

    beforeEach(() => {
        mockApi.reset()
    })

    it('should show loading cards while fetching data', () => {
        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>
        )
        expect(screen.getAllByTestId(LOADING_TEST_ID))
    })

    it('should show static integrations, loaded apps and request app', async () => {
        mockApi.onGet('/api/apps/').reply(200, {data: [dummyAppListData]})

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>
        )
        await waitFor(() => {
            expect(screen.queryAllByTestId(LOADING_TEST_ID).length).toBe(0)
        })
        expect(screen.getByText('Shopify'))
        expect(screen.getByText('My test app'))
        expect(screen.getByText('Can’t find what you need?'))
    })

    it('should show a message saying the category is empty when a category that has no apps is set', async () => {
        mockApi.onGet('/api/apps/').reply(200, {data: []})

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${CATEGORY_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.categories[0]
                )}`,
            }
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText(/They are no apps/))
    })

    it('should show as many cards as there is in a category when a category is set', async () => {
        const dummyAppsNumber = 6
        const dummyApps = []
        for (let i = 0; i < dummyAppsNumber; i++) {
            dummyApps.push({
                ...dummyAppListData,
                name: `${dummyAppListData.name}-${i}`,
            })
        }
        mockApi.onGet('/api/apps/').reply(200, {data: dummyApps})

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${CATEGORY_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.categories[0]
                )}`,
            }
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        const matcher = new RegExp(`${dummyAppListData.name}`)
        expect(screen.getAllByText(matcher).length).toBe(dummyAppsNumber)
    })

    it('should show all the cards whose lowercased title match the search param', async () => {
        const dummyAppsNumber = 4
        const dummyApps = []
        for (let i = 0; i < dummyAppsNumber; i++) {
            dummyApps.push({
                ...dummyAppListData,
                name: `${dummyAppListData.name}-${i}`,
            })
        }
        dummyApps[0].name = dummyApps[0].name.toUpperCase()
        mockApi.onGet('/api/apps/').reply(200, {data: dummyApps})

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.name.toLowerCase()
                )}`,
            }
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getAllByTestId(CARD_LINK_ID).length).toBe(dummyAppsNumber)
    })

    it('should show 0 cards when there is no match', async () => {
        const dummyAppsNumber = 4
        const dummyApps = []
        for (let i = 0; i < dummyAppsNumber; i++) {
            dummyApps.push({
                ...dummyAppListData,
                name: `${dummyAppListData.name}-${i}`,
            })
        }
        mockApi.onGet('/api/apps/').reply(200, {data: dummyApps})

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=nada}`,
            }
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText(/0 results/))
        expect(screen.queryAllByTestId(CARD_LINK_ID).length).toBe(0)
    })
})
