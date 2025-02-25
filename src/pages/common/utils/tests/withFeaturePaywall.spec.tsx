import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import { withFeaturePaywall } from '../withFeaturePaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Not paywalled</div>
)

const CustomPaywallComponent = () => (
    <div data-testid="custom-paywall-component">Paywalled</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('withFeaturePaywall', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            current_subscription: account.current_subscription,
            features: fromJS({
                [AccountFeature.InstagramComment]: { enabled: true },
                [AccountFeature.RevenueStatistics]: { enabled: false },
            }),
        }),
        billing: fromJS(billingState),
    }

    it('should render the passed component when the feature is available', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.InstagramComment,
        )(AnyComponent)
        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        expect(screen.getByText('Not paywalled')).toBeInTheDocument()
    })

    it('should not render the passed component when the feature is unavailable', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics,
        )(AnyComponent)
        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        expect(
            screen.getByText(
                paywallConfigs[AccountFeature.RevenueStatistics]!.header,
            ),
        ).toBeInTheDocument()
    })

    it('should not render the passed component when the feature is unavailable and use a custom paywall', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics,
            CustomPaywallComponent,
        )(AnyComponent)
        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        expect(screen.getByText('Paywalled')).toBeInTheDocument()
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
            customPaywallConfigs,
        )(AnyComponent)
        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        expect(screen.getByText('Custom page header')).toBeInTheDocument()
    })
})
