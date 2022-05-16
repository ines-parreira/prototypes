import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {account} from '../../../../../fixtures/account'
import {billingState} from '../../../../../fixtures/billing'
import {basicPlan} from '../../../../../fixtures/subscriptionPlan'
import {RootState, StoreDispatch} from '../../../../../state/types'

import AutomationSubscriptionModal from '../AutomationSubscriptionModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomationSubscriptionModal />', () => {
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

    const minProps: ComponentProps<typeof AutomationSubscriptionModal> = {
        confirmLabel: 'I am sure',
        isOpen: false,
        onClose: jest.fn(),
    }

    it('should not render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionModal {...minProps} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should display loader', async () => {
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )
        const button = await findByText(/I am sure/)
        fireEvent.click(button)
        expect(button).toMatchSnapshot()
    })

    it('should render for customers already with full add-on features', async () => {
        const {baseElement, findByText} = render(
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
                <AutomationSubscriptionModal {...minProps} isOpen />
            </Provider>
        )

        await findByText(/Cancel subscription/i)
        expect(baseElement).toMatchSnapshot()
    })

    it('should display image', async () => {
        const {findByAltText} = render(
            <Provider store={mockStore(defaultState)}>
                {' '}
                <AutomationSubscriptionModal
                    {...minProps}
                    isOpen
                    image="foo.png"
                />
            </Provider>
        )
        const img = await findByAltText(/features/)
        expect(img).toMatchSnapshot()
    })
})
