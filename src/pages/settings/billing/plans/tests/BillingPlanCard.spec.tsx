import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {
    advancedPlan,
    basicPlan,
    customPlan,
    enterprisePlan,
    legacyPlan,
    proPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {account} from '../../../../../fixtures/account'
import {RootState, StoreDispatch} from '../../../../../state/types'
import BillingPlanCard from '../BillingPlanCard'
import {Plan} from '../../../../../models/billing/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<BillingPlanCard />', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
    }

    const minProps: ComponentProps<typeof BillingPlanCard> = {
        plan: {...basicPlan, currencySign: '$'},
        isCurrentPlan: false,
        footer: <span>Foo footer</span>,
        className: 'fooClass',
    }

    it.each<[string, Plan]>([
        ['Basic plan', basicPlan],
        ['Advanced plan', advancedPlan],
        ['Pro plan', proPlan],
        ['Enterprise plan', enterprisePlan],
        ['Custom plan', customPlan],
        ['Legacy plan', legacyPlan],
    ])('should render plan card for the %s', (testName, plan) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlanCard
                    {...minProps}
                    plan={{...plan, currencySign: '$'}}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the legacy badge when account is current and account has legacy features', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        meta: {
                            has_legacy_features: true,
                        },
                    }),
                })}
            >
                <BillingPlanCard
                    {...minProps}
                    plan={{...basicPlan, currencySign: '$'}}
                    isCurrentPlan
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
