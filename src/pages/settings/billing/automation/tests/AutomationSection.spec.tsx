import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'

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
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'start_datetime'],
                        '2021-08-30T00:00:00Z'
                    ),
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
