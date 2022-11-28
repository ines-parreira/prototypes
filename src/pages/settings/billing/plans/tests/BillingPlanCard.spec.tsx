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
    customAutomationPrice,
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    transitoryPlans,
} from 'fixtures/productPrices'
import {PlanWithCurrencySign} from 'state/billing/types'
import BillingPlanCard from '../BillingPlanCard'
import {getPlanCardFeaturesForPlan} from '../billingPlanFeatures'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('lodash/uniqueId', () => () => '42')

describe('<BillingPlanCard />', () => {
    const {
        basicPlan,
        basicAutomationPlan,
        proPlan,
        proAutomationPlan,
        advancedPlan,
        advancedAutomationPlan,
        customPlan,
        customAutomationPlan,
        legacyPlan,
    } = transitoryPlans

    const productPrices = _cloneDeep(products)
    productPrices[0].prices.push(legacyBasicHelpdeskPrice, customHelpdeskPrice)
    productPrices[1].prices.push(
        legacyBasicAutomationPrice,
        customAutomationPrice
    )

    const defaultState: Partial<RootState> = {
        billing: fromJS({
            ...billingState,
            products: productPrices,
        }),
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        amount: basicPlan.amount,
        currency: basicPlan.currency,
        interval: basicPlan.interval,
        features: getPlanCardFeaturesForPlan({
            plan: basicPlan,
            enableHardCodedFeatures: false,
        }),
        isCurrentPlan: false,
        name: basicPlan.name,
        footer: <span>Foo footer</span>,
        className: 'fooClass',
    }

    it.each<[string, PlanWithCurrencySign]>([
        ['Basic plan', basicPlan],
        ['Advanced plan', advancedPlan],
        ['Pro plan', proPlan],
        ['Custom plan', customPlan],
        ['Legacy plan', legacyPlan],
        ['Basic automation plan', basicAutomationPlan],
        ['Advanced automation plan', advancedAutomationPlan],
        ['Pro automation plan', proAutomationPlan],
        ['Custom automation plan', customAutomationPlan],
    ])('should render plan card for the %s', (testName, plan) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    amount={plan.amount}
                    currency={plan.currency}
                    interval={plan.interval}
                    name={plan.name}
                    features={getPlanCardFeaturesForPlan({
                        plan,
                        enableHardCodedFeatures: plan.is_legacy,
                    })}
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
                    features={getPlanCardFeaturesForPlan({
                        plan: proPlan,
                        enableHardCodedFeatures: false,
                    })}
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
                        legacyBasicHelpdeskPrice.price_id
                    ),
                })}
            >
                <BillingPlanCard
                    {...minProps}
                    amount={legacyPlan.amount}
                    currency={legacyPlan.currency}
                    interval={legacyPlan.interval}
                    name={legacyPlan.name}
                    features={getPlanCardFeaturesForPlan({
                        plan: legacyPlan,
                        enableHardCodedFeatures: true,
                    })}
                    isCurrentPlan
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
