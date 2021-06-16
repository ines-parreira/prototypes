import React from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../state/types'
import {AccountFeature} from '../../../../state/currentAccount/types'
import {
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../../../fixtures/subscriptionPlan'

import withPaywall from '../withPaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Just a component...</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('withPaywall', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            features: fromJS({
                [AccountFeature.InstagramComment]: {enabled: true},
                [AccountFeature.AutoAssignment]: {enabled: false},
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

    it('should render the passed component when the feature is available', () => {
        const PaywalledComponent = withPaywall(AccountFeature.InstagramComment)(
            AnyComponent
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render the passed component when the feature is unavailable', () => {
        const PaywalledComponent = withPaywall(AccountFeature.AutoAssignment)(
            AnyComponent
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
