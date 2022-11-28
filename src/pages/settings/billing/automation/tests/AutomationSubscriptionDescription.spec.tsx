import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
} from 'fixtures/productPrices'
import {RootState, StoreDispatch} from 'state/types'

import AutomationSubscriptionDescription from '../AutomationSubscriptionDescription'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const DATE_TO_USE = new Date('2019-09-03')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

describe('<AutomationSubscriptionDescription />', () => {
    window.GORGIAS_SUPPORT_EMAIL = 'support@gorgias.com'

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS(billingState),
    }

    it('should render for customers without any addon features', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['created_datetime'],
                        '2021-10-04T00:00:00Z'
                    ),
                })}
            >
                <AutomationSubscriptionDescription />
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
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render for customers already with legacy add-on features', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['created_datetime'],
                        '2021-09-12T00:00:00Z'
                    ),
                })}
            >
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a discounted price when the price is discounted', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    billing: defaultState.billing
                        ?.setIn(
                            ['products', 0, 'prices'],
                            fromJS([legacyBasicHelpdeskPrice])
                        )
                        ?.setIn(
                            ['products', 1, 'prices'],
                            fromJS([legacyBasicAutomationPrice])
                        ),
                    currentAccount: defaultState.billing?.setIn(
                        ['current_subscription', 'products'],
                        fromJS({
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                legacyBasicAutomationPrice.price_id,
                        })
                    ),
                })}
            >
                <AutomationSubscriptionDescription />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
