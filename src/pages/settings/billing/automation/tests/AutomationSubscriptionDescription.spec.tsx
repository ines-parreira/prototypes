import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {account} from '../../../../../fixtures/account'
import {billingState} from '../../../../../fixtures/billing'
import {basicPlan} from '../../../../../fixtures/subscriptionPlan'
import {RootState, StoreDispatch} from '../../../../../state/types'

import AutomationSubscriptionDescription from '../AutomationSubscriptionDescription'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationSubscriptionDescription />', () => {
    window.GORGIAS_SUPPORT_EMAIL = 'support@gorgias.com'

    const automationPlanId = basicPlan.automation_addon_equivalent_plan!
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: basicPlan.id,
                status: 'active',
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [automationPlanId]: {
                    ...basicPlan,
                    id: automationPlanId,
                    amount: basicPlan.amount + 2000,
                    automation_addon_included: true,
                },
            }),
        }),
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
                            plan: automationPlanId,
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
})
