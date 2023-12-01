import React, {ComponentProps} from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import _cloneDeep from 'lodash/cloneDeep'

import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {
    HELPDESK_PRODUCT_ID,
    products,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import UpgradeButton from 'pages/common/components/UpgradeButton'

import AutomationSubscriptionButton from '../AutomationSubscriptionButton'

const mockUpgradeButton = jest.fn()
jest.mock(
    'pages/common/components/UpgradeButton/UpgradeButton',
    () => (props: ComponentProps<typeof UpgradeButton>) => {
        mockUpgradeButton(props)
        return 'UpgradeButtonMock'
    }
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('AutomationSubscriptionButton', () => {
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
    } as RootState

    const minProps: ComponentProps<typeof AutomationSubscriptionButton> = {
        label: 'Foo',
        position: 'right',
        onClick: jest.fn(),
    }

    it('should pass the props to the upgrade button', () => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.NewBillingInterface]: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionButton {...minProps} />
            </Provider>
        )
        expect(mockUpgradeButton).toHaveBeenLastCalledWith(minProps)
    })

    it('should pass label "Upgrade" and undefined onClick and the state with Automate checked and basic plan modal opened to the upgrade button for the starter plan', () => {
        const productsWithStarterPrice = _cloneDeep(products)
        products[0].prices.push(starterHelpdeskPrice)

        render(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    starterHelpdeskPrice.price_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithStarterPrice,
                    }),
                })}
            >
                <AutomationSubscriptionButton label="Foo" />
            </Provider>
        )
        expect(mockUpgradeButton).toHaveBeenCalledWith({
            label: minProps.label,
            onClick: undefined,
            position: 'left',
            state: undefined,
        })
    })
})
