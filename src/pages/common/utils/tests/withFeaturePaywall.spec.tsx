import React from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {AccountFeature} from 'state/currentAccount/types'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'
import {PaywallConfig, paywallConfigs} from 'config/paywalls'
import {account} from 'fixtures/account'

import withFeaturePaywall from '../withFeaturePaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Just a component...</div>
)

const CustomPaywallComponent = () => (
    <div data-testid="custom-paywall-component">Custom Paywall</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('withFeaturePaywall', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            current_subscription: account.current_subscription,
            features: fromJS({
                [AccountFeature.InstagramComment]: {enabled: true},
                [AccountFeature.RevenueStatistics]: {enabled: false},
            }),
        }),
        billing: fromJS(billingState),
    }

    it('should render the passed component when the feature is available', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.InstagramComment
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render the passed component when the feature is unavailable', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render the passed component when the feature is unavailable and use a custom paywall', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics,
            CustomPaywallComponent
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should pass custom paywall configuration props', () => {
        const customPaywallConfigs = {
            [AccountFeature.RevenueStatistics]: {
                ...paywallConfigs[AccountFeature.RevenueStatistics],
                pageHeader: 'Custom page header',
            } as PaywallConfig,
        }

        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics,
            undefined,
            customPaywallConfigs
        )(AnyComponent)
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
