import React, {ComponentProps} from 'react'
import {act, render} from '@testing-library/react'
import {fromJS, List} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _cloneDeep from 'lodash/cloneDeep'

import {AUTOMATION_OVERVIEW, stats as statsConfig} from 'config/stats'
import {AutomationStatsSelfServiceMetric} from 'pages/stats/AutomationStatsSelfServiceMetric'
import {RootState, StoreDispatch} from 'state/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {billingState} from 'fixtures/billing'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {
    automationSubscriptionProductPrices,
    legacyWithoutAutomationAddOnProductPrices,
} from 'fixtures/account'
import {entitiesInitialState} from 'fixtures/entities'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationStatsSelfServiceMetric />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    const data = fromJS([
        {
            delta: 100,
            more_is_better: true,
            name: 'automated_via_selfservice',
            type: 'percent',
            value: 25,
        },
    ])
    const metricConfig = (
        statsConfig.get(AUTOMATION_OVERVIEW).get('metrics') as List<any>
    ).get(2)

    const minProps: ComponentProps<typeof AutomationStatsSelfServiceMetric> = {
        index: 2,
        loading: false,
        data,
        meta: fromJS({}),
        metricConfig,
        id: 'automated_via_selfservice-2',
    }

    const productsWithStarterPrice = _cloneDeep(products)
    productsWithStarterPrice[0].prices.push(starterHelpdeskPrice)

    const productsWithLegacy = _cloneDeep(products)
    productsWithLegacy[0].prices.push(legacyBasicHelpdeskPrice)
    productsWithLegacy[1].prices.push(legacyBasicAutomationPrice)

    const defaultState = {
        billing: fromJS({...billingState, products: productsWithStarterPrice}),
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: starterHelpdeskPrice.price_id,
                },
            },
        }),
        entities: entitiesInitialState,
    }

    const selfServiceConfiguration: SelfServiceConfiguration = {
        id: 1,
        type: 'shopify',
        shop_name: 'my-shop',
        created_datetime: '2019-11-15 19:00:00.000000',
        updated_datetime: '2019-11-15 19:00:00.000000',
        deactivated_datetime: null,
        report_issue_policy: {
            enabled: true,
            cases: [],
        },
        track_order_policy: {
            enabled: true,
        },
        cancel_order_policy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        return_order_policy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        quick_response_policies: [],
    }

    type state = Parameters<typeof mockStore>[0]
    it.each<[string, state]>([
        ['paywall', defaultState],
        [
            'legacy',
            {
                currentAccount: fromJS({
                    current_subscription: {
                        products: legacyWithoutAutomationAddOnProductPrices,
                    },
                }),
                billing: fromJS({
                    ...billingState,
                    products: productsWithLegacy,
                }),
                entities: defaultState.entities,
            },
        ],
        [
            'setup',
            {
                ...defaultState,
                currentAccount: fromJS({
                    current_subscription: {
                        products: automationSubscriptionProductPrices,
                    },
                }),
            },
        ],
        [
            'stats',
            {
                currentAccount: fromJS({
                    current_subscription: {
                        products: automationSubscriptionProductPrices,
                    },
                }),
                entities: {
                    ...defaultState.entities,
                    selfServiceConfigurations: {'0': selfServiceConfiguration},
                },
                billing: fromJS(billingState),
            },
        ],
    ])('should render %s', (_, state) => {
        act(() => {
            const {container} = render(
                <Provider store={mockStore(state)}>
                    <AutomationStatsSelfServiceMetric {...minProps} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
