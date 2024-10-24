import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    HELPDESK_PRODUCT_ID,
    products,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import {RootState, StoreDispatch} from 'state/types'

import AutomateSubscriptionButton from '../AutomateSubscriptionButton'

const mockUpgradeButton = jest.fn()
jest.mock(
    'pages/common/components/UpgradeButton/UpgradeButton',
    () => (props: ComponentProps<typeof UpgradeButton>) => {
        mockUpgradeButton(props)
        return 'UpgradeButtonMock'
    }
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('AutomateSubscriptionButton', () => {
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
    } as RootState

    const minProps: ComponentProps<typeof AutomateSubscriptionButton> = {
        label: 'Foo',
        position: 'right',
        onClick: jest.fn(),
    }

    it('should pass the props to the upgrade button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AutomateSubscriptionButton {...minProps} />
            </Provider>
        )
        expect(mockUpgradeButton).toHaveBeenLastCalledWith(minProps)
    })

    it('should pass label "Upgrade" and undefined onClick and the state with Automate checked and basic plan modal opened to the upgrade button for the starter plan', () => {
        const availablePlansWithStarterPlan = _cloneDeep(products)
        products[0].prices.push(starterHelpdeskPlan)

        render(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    starterHelpdeskPlan.price_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: availablePlansWithStarterPlan,
                    }),
                })}
            >
                <AutomateSubscriptionButton label="Foo" />
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
