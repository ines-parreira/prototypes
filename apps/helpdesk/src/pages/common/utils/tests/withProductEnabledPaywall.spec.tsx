import React from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { ProductType } from 'models/billing/types'
import * as billingSelectors from 'state/billing/selectors'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import withProductEnabledPaywall from '../withProductEnabledPaywall'

const AnyComponent = () => (
    <div data-testid="paywalled-component">Paywalled component...</div>
)

const CustomPaywallComponent = () => (
    <div data-testid="custom-paywall-component">Custom Paywall</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const currentAccountHasProductSpy = jest.spyOn(
    billingSelectors,
    'currentAccountHasProduct',
)

describe('withProductEnabledPaywall', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }

    afterEach(cleanup)

    it('should render the component if the account has the product', () => {
        const PaywalledComponent = withProductEnabledPaywall(
            ProductType.Voice,
            AccountFeature.PhoneNumber,
            CustomPaywallComponent,
        )(AnyComponent)

        currentAccountHasProductSpy.mockReturnValueOnce((() => true) as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        screen.getByTestId('paywalled-component')
    })

    it('should render the custom paywall component if the account does not have the product', () => {
        const PaywalledComponent = withProductEnabledPaywall(
            ProductType.Voice,
            AccountFeature.PhoneNumber,
            CustomPaywallComponent,
        )(AnyComponent)

        currentAccountHasProductSpy.mockReturnValueOnce((() => false) as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        screen.getByTestId('custom-paywall-component')
    })

    it('should render the default paywall component if the account does not have the product and no custom paywall is provided', () => {
        const customPaywallConfig = {
            [AccountFeature.PhoneNumber]: {
                ...paywallConfigs[AccountFeature.PhoneNumber],
                header: 'Custom header',
            } as PaywallConfig,
        }

        const PaywalledComponent = withProductEnabledPaywall(
            ProductType.Voice,
            AccountFeature.PhoneNumber,
            undefined,
            customPaywallConfig,
        )(AnyComponent)

        currentAccountHasProductSpy.mockReturnValueOnce((() => false) as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <PaywalledComponent />
            </Provider>,
        )

        screen.getByText('Custom header')
    })
})
