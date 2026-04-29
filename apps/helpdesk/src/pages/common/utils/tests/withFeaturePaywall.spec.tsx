import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { PaywallConfig } from 'config/paywalls'
import { paywallConfigs } from 'config/paywalls'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { AccountFeature } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import { withFeaturePaywall } from '../withFeaturePaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Not paywalled</div>
)

const CustomPaywallComponent = () => (
    <div data-testid="custom-paywall-component">Paywalled</div>
)

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
        render(<PaywalledComponent />, { storeState: defaultState })

        expect(screen.getByText('Not paywalled')).toBeInTheDocument()
    })

    it('should not render the passed component when the feature is unavailable', () => {
        const PaywalledComponent = withFeaturePaywall(
            AccountFeature.RevenueStatistics,
        )(AnyComponent)
        render(<PaywalledComponent />, { storeState: defaultState })

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
        render(<PaywalledComponent />, { storeState: defaultState })

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
        render(<PaywalledComponent />, { storeState: defaultState })

        expect(screen.getByText('Custom page header')).toBeInTheDocument()
    })
})
