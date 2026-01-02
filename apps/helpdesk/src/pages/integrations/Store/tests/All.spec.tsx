import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { INTEGRATION_TYPE_CONFIG } from 'config'
import { dummyAppListData } from 'fixtures/apps'
import client from 'models/api/resources'
import type { HelpdeskPlan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { IntegrationType } from 'models/integration/constants'
import type { Integration } from 'models/integration/types'
import type { AccountFeatureMetadata } from 'state/currentAccount/types'
import { AccountFeature } from 'state/currentAccount/types'
import type { IntegrationListItem } from 'state/integrations/types'
import { renderWithRouter } from 'utils/testing'

import All, { addRequiredPlanToIntegrations } from '../All'
import { CARD_LINK_TEST_ID, LOADING_TEST_ID } from '../Card'
import {
    CATEGORY_URL_PARAM,
    MAX_CARDS_DISPLAYED,
    SEARCH_URL_PARAM,
} from '../constants'

const mockStore = configureMockStore([thunk])

const HELPDESK_PRODUCT_ID = 'hepdeskpid'
const INTEGRATIONS_PLAN_ID = '3'
const store = mockStore({
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: INTEGRATIONS_PLAN_ID,
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
                        plan_id: INTEGRATIONS_PLAN_ID,
                        integrations: 150,
                        amount: 100,
                    },
                ],
            },
            {
                type: ProductType.Automation,
                id: 'don’t care',
                prices: [{ amount: 100 }],
            },
        ],
    }),
    integrations: fromJS({
        integrations: Array.from({ length: 5 }, (_, index) => ({ id: index })),
    }),
})

const plans = [
    {
        plan_id: INTEGRATIONS_PLAN_ID,
        integrations: 150,
        cadence: Cadence.Month,
        amount: 100,
        name: 'FeatureName',
        features: {
            [AccountFeature.MagentoIntegration]: {
                enabled: true,
            } as AccountFeatureMetadata,
        },
    } as HelpdeskPlan,
]

describe('addRequiredPlanToIntegrations()', () => {
    it('should return the required plan', () => {
        const magentoConf = INTEGRATION_TYPE_CONFIG.find(
            (conf) => conf.type === IntegrationType.Magento2,
        )
        expect(
            addRequiredPlanToIntegrations(
                [magentoConf as unknown as IntegrationListItem],
                [{} as Integration],
                {},
                plans,
            )[0].requiredPriceName,
        ).toBe(plans[0].name)
    })
})

describe('<All />', () => {
    const mockApi = new MockAdapter(client)

    beforeEach(() => {
        mockApi.reset()
    })

    it('should show loading cards while fetching data', () => {
        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
        )
        expect(screen.getAllByTestId(LOADING_TEST_ID))
    })

    it('should show static integrations, loaded apps', async () => {
        mockApi.onGet('/api/apps/').reply(200, { data: [dummyAppListData] })

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryAllByTestId(LOADING_TEST_ID).length).toBe(0)
        })
        expect(screen.getByText('Shopify'))
        expect(screen.getByText('My test app'))
    })

    it('should show a message saying the category is empty when a category that has no apps is set', async () => {
        mockApi.onGet('/api/apps/').reply(200, { data: [] })

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${CATEGORY_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.categories[0],
                )}`,
            },
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText(/They are no apps/))
    })

    it('should not show more than 5 cards par category when there is no filter', async () => {
        const dummyAppsNumber = 6
        const dummyApps = []
        for (let i = 0; i < dummyAppsNumber; i++) {
            dummyApps.push({
                ...dummyAppListData,
                name: `${dummyAppListData.name}-${i}`,
            })
        }
        mockApi.onGet('/api/apps/').reply(200, { data: dummyApps })

        const { rerender } = renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })

        rerender(
            <Provider store={store}>
                <All />
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        const matcher = new RegExp(`${dummyAppListData.name}`)
        expect(screen.getAllByText(matcher).length).toBe(MAX_CARDS_DISPLAYED)
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
        mockApi.onGet('/api/apps/').reply(200, { data: dummyApps })

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${CATEGORY_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.categories[0],
                )}`,
            },
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
        mockApi.onGet('/api/apps/').reply(200, { data: dummyApps })

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=${encodeURIComponent(
                    dummyAppListData.name.toLowerCase(),
                )}`,
            },
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getAllByTestId(CARD_LINK_TEST_ID).length).toBe(
            dummyAppsNumber,
        )
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
        mockApi.onGet('/api/apps/').reply(200, { data: dummyApps })

        renderWithRouter(
            <Provider store={store}>
                <All />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=nada}`,
            },
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText(/0 results/))
        expect(screen.queryAllByTestId(CARD_LINK_TEST_ID).length).toBe(0)
    })
})
