import React from 'react'
import {fromJS} from 'immutable'
import {render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import LD from 'launchdarkly-react-client-sdk'

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

import All, {addRequiredPlanToIntegrations} from '../All'
import {LOADING_TEST_ID} from '../Card'

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
            )[0].requiredPlanName
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
            )[0].requiredPlanName
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
        render(
            <Provider store={store}>
                <All />
            </Provider>
        )
        expect(screen.getAllByTestId(LOADING_TEST_ID))
    })

    it('should show static integrations, loaded apps and request app', async () => {
        mockApi.onGet('/api/apps/').reply(200, {data: [dummyAppListData]})

        render(
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
    // TODO(@Manuel): Add additional tests here once the
    // filter / search feature are implemented
})
