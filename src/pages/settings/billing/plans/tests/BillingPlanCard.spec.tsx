import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
    customAutomatePlan,
    customHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomatePlan,
    legacyBasicHelpdeskPlan,
    products,
    proMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {HelpdeskPlan} from 'models/billing/types'
import {getFormattedAmount} from 'models/billing/utils'
import BillingPlanCard from '../BillingPlanCard'
import {getPlanCardFeaturesForPrices} from '../billingPlanFeatures'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('lodash/uniqueId', () => () => '42')

describe('<BillingPlanCard />', () => {
    const productPrices = _cloneDeep(products)
    productPrices[0].prices.push(legacyBasicHelpdeskPlan, customHelpdeskPlan)
    productPrices[1].prices.push(legacyBasicAutomatePlan, customAutomatePlan)

    const defaultState: Partial<RootState> = {
        billing: fromJS({
            ...billingState,
            products: productPrices,
        }),
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        amount: getFormattedAmount(basicMonthlyHelpdeskPlan.amount),
        currency: basicMonthlyHelpdeskPlan.currency,
        interval: basicMonthlyHelpdeskPlan.interval,
        features: getPlanCardFeaturesForPrices(
            [basicMonthlyHelpdeskPlan],
            false
        ),
        isCurrentPrice: false,
        name: basicMonthlyHelpdeskPlan.name,
        footer: <span>Foo footer</span>,
        className: 'fooClass',
    }

    it.each<[string, HelpdeskPlan]>([
        ['Basic price', basicMonthlyHelpdeskPlan],
        ['Advanced price', advancedMonthlyHelpdeskPlan],
        ['Pro price', proMonthlyHelpdeskPlan],
        ['Custom price', customHelpdeskPlan],
        ['Legacy price', legacyBasicHelpdeskPlan],
    ])('should render plan card for the %s', (testName, price) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    amount={getFormattedAmount(price.amount)}
                    currency={price.currency}
                    interval={price.interval}
                    name={price.name}
                    features={getPlanCardFeaturesForPrices(
                        [price],
                        price.is_legacy
                    )}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render features list from the feature plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    features={getPlanCardFeaturesForPrices(
                        [proMonthlyHelpdeskPlan],
                        false
                    )}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the legacy badge for current legacy plan when the account has a legacy plan', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        [
                            'current_subscription',
                            'products',
                            HELPDESK_PRODUCT_ID,
                        ],
                        legacyBasicHelpdeskPlan.price_id
                    ),
                })}
            >
                <BillingPlanCard
                    {...minProps}
                    amount={getFormattedAmount(legacyBasicHelpdeskPlan.amount)}
                    currency={legacyBasicHelpdeskPlan.currency}
                    interval={legacyBasicHelpdeskPlan.interval}
                    name={legacyBasicHelpdeskPlan.name}
                    features={getPlanCardFeaturesForPrices(
                        [legacyBasicHelpdeskPlan],
                        true
                    )}
                    isCurrentPrice
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
