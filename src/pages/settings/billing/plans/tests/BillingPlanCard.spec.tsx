import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import * as billingSelectors from 'state/billing/selectors'
import {billingState} from 'fixtures/billing'
import {
    customAutomationPrice,
    customHelpdeskPrice,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    transitoryPlans,
} from 'fixtures/productPrices'
import {PlanWithCurrencySign} from 'state/billing/types'
import BillingPlanCard from '../BillingPlanCard'

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
    products[0].prices.push(legacyBasicHelpdeskPrice, customHelpdeskPrice)
    products[1].prices.push(legacyBasicAutomationPrice, customAutomationPrice)

    const defaultState: Partial<RootState> = {
        billing: fromJS({
            ...billingState,
            products: productPrices,
        }),
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        plan: basicPlan,
        featuresPlan: basicPlan,
        isCurrentPlan: false,
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
                <BillingPlanCard {...minProps} plan={plan} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render features list from the feature plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    plan={basicPlan}
                    featuresPlan={proPlan}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the legacy badge for current legacy plan when the account has a legacy plan', () => {
        const hasLegacyPlanSpy = jest.spyOn(billingSelectors, 'hasLegacyPlan')
        hasLegacyPlanSpy.mockImplementation(() => true)

        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    plan={legacyPlan}
                    isCurrentPlan
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
