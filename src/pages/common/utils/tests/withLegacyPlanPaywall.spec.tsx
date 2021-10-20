import React from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../state/types'
import {
    advancedPlan,
    basicPlan,
    proLegacyPlan,
    proPlan,
} from '../../../../fixtures/subscriptionPlan'

import withLegacyPlanPaywall from '../withLegacyPlanPaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Just a component...</div>
)

const CustomPaywallComponent = () => (
    <div data-testid="custom-paywall-component">Custom Paywall</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('withLegacyPlanPaywall', () => {
    it('should render the passed component when thus subscription is public', () => {
        const stateWithPublicPlan: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: fromJS({
                    plan: proPlan.id,
                }),
            }),
            billing: fromJS({
                plans: fromJS({
                    [basicPlan.id]: basicPlan,
                    [proPlan.id]: proPlan,
                    [advancedPlan.id]: advancedPlan,
                }),
            }),
        }
        const PaywalledComponent = withLegacyPlanPaywall(
            CustomPaywallComponent
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(stateWithPublicPlan)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render the passed component when the current subscription is legacy', () => {
        const stateWithLegacyPlan: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: fromJS({
                    plan: proLegacyPlan.id,
                }),
            }),
            billing: fromJS({
                plans: fromJS({
                    [basicPlan.id]: basicPlan,
                    [proPlan.id]: proPlan,
                    [proLegacyPlan.id]: proLegacyPlan,
                    [advancedPlan.id]: advancedPlan,
                }),
            }),
        }
        const PaywalledComponent = withLegacyPlanPaywall(
            CustomPaywallComponent
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(stateWithLegacyPlan)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
