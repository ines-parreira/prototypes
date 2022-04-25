import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {
    basicPlan,
    proPlan,
    advancedPlan,
    basicAutomationPlan,
} from 'fixtures/subscriptionPlan'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {PlanInterval} from 'models/billing/types'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import ChangePlanModal from '../ChangePlanModal'
import BillingPlanCard from '../BillingPlanCard'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    '../BillingPlanCard',
    () =>
        ({
            plan,
            featuresPlan,
            theme,
            renderBody,
            className,
        }: ComponentProps<typeof BillingPlanCard>) =>
            (
                <div>
                    BillingPlanCard mock,
                    <div>theme: {theme}</div>
                    <div>
                        renderBody: {renderBody?.(<span>features mock</span>)}
                    </div>
                    <div>className: {className}</div>
                    <div>plan: {plan.id}</div>
                    <div>features plan: {featuresPlan.id}</div>
                </div>
            )
)

jest.mock(
    'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer',
    () =>
        ({height}: ComponentProps<typeof SynchronizedScrollTopContainer>) =>
            (
                <div>
                    SynchronizedScrollTopContainer mock,
                    <div>height: {height}</div>
                </div>
            )
)

describe('<ChangePlanModal />', () => {
    const minProps = {
        confirmLabel: 'Confirm',
        currentPlan: fromJS({
            ...proPlan,
            id: `${proPlan.name.toLowerCase()}-monthly`,
            interval: PlanInterval.Month,
        }) as Map<any, any>,
        description: 'description of the plan change',
        header: 'Title of modal',
        isOpen: true,
        isUpdating: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        renderComparedPlan: () => <div>renderComparedPlan</div>,
    }
    const plans = {
        [basicPlan.id]: basicPlan,
        [basicAutomationPlan.id]: basicAutomationPlan,
        [proPlan.id]: proPlan,
        [advancedPlan.id]: advancedPlan,
    }
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: basicPlan.id,
            },
        }),
        billing: fromJS({
            ...billingState,
            plans,
        }),
    }

    it('should not render the modal', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} isOpen={false} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should render the automation plan features for the current automation plan', () => {
        const {baseElement} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            plan: basicAutomationPlan.id,
                        },
                    }),
                })}
            >
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should call onConfirm callback when clicking on button', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        userEvent.click(getByText('Confirm'))
        expect(minProps.onConfirm).toHaveBeenCalled()
    })

    it('should display only compared plan when there is no current plan', () => {
        const {baseElement} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'plan'],
                        'some-unknown-plan'
                    ),
                })}
            >
                <ChangePlanModal {...minProps} />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })
})
