import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import _cloneDeep from 'lodash/cloneDeep'
import {
    account,
    automationSubscriptionProductPrices,
    legacyWithoutAutomationAddOnProductPrices,
} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'

import {
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import AutomationSection from '../AutomationSection'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationSection />', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS({
            ...billingState,
        }),
    }

    it('should render', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSection />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for customers already with full add-on features', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                })}
            >
                <AutomationSection />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for customers already with legacy add-on features', () => {
        const productsWithLegacy = _cloneDeep(products)
        productsWithLegacy[0].prices.push(legacyBasicHelpdeskPrice)
        productsWithLegacy[1].prices.push(legacyBasicAutomationPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: legacyWithoutAutomationAddOnProductPrices,
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithLegacy,
                    }),
                })}
            >
                <AutomationSection />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for trialing customers', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            status: 'trialing',
                        },
                    }),
                })}
            >
                <AutomationSection />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
