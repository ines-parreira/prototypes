import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {createMemoryHistory} from 'history'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent} from '@testing-library/react'

import history from '../../../../history'
import BillingPlans from '../BillingPlans'
import {
    basicPlan,
    proPlan,
    advancedPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {account} from '../../../../../fixtures/account'
import BillingPlansComparison from '../BillingPlansComparison'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {billingState} from '../../../../../fixtures/billing'
import {renderWithRouter} from '../../../../../utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
let mockPreviousSubscription: Map<any, any>

jest.mock('../../../../history')
jest.mock(
    '../BillingPlansComparison',
    () => ({
        openedPlanModal,
        onSubscriptionChanged,
    }: ComponentProps<typeof BillingPlansComparison>) => (
        <div>
            BillingPlansComparison mock, openedPlanModal: {openedPlanModal}
            <button
                value="Subscription changed"
                data-testid="subscription-changed"
                onClick={() => {
                    onSubscriptionChanged(mockPreviousSubscription)
                }}
            />
        </div>
    )
)

describe('<BillingPlans/>', () => {
    const publicPlans = {
        [basicPlan.id]: basicPlan,
        [proPlan.id]: proPlan,
        [advancedPlan.id]: advancedPlan,
    }
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: Object.values(publicPlans)[0]!.id,
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: publicPlans,
        }),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockPreviousSubscription = fromJS({})
    })

    it('it should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <BillingPlans />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('it should render the initially opened plan popover', () => {
        const history = createMemoryHistory({initialEntries: ['/']})
        history.replace('/', {openedPlanModal: 'Some plan'})
        const {queryByText} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <BillingPlans />
            </Provider>,
            {history}
        )
        expect(queryByText(/Some plan/)).not.toBe(null)
    })

    it('should do nothing on subscription change when previous subscription had plan defined and the new subscription is not trialing', () => {
        mockPreviousSubscription = fromJS({status: 'trialing'})
        const {getByTestId} = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.set(
                        'current_subscription',
                        fromJS({status: 'active'})
                    ),
                })}
            >
                <BillingPlans />
            </Provider>
        )
        fireEvent.click(getByTestId('subscription-changed'))
    })

    describe.each<[string, Map<any, any>, Map<any, any>]>([
        [
            'previous subscription did not have status defined',
            fromJS({}),
            fromJS({status: 'active'}),
        ],
        [
            'current subscription is trialing',
            fromJS({status: 'active'}),
            fromJS({status: 'trialing'}),
        ],
    ])(
        'subscription change when %s',
        (testName, prevSubscription, currentSubscription) => {
            beforeEach(() => {
                mockPreviousSubscription = prevSubscription
            })

            it('should redirect to the billing page if have to pay with shopify', () => {
                const {getByTestId} = renderWithRouter(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount
                                ?.set(
                                    'current_subscription',
                                    currentSubscription
                                )
                                .setIn(
                                    ['meta', 'should_pay_with_shopify'],
                                    true
                                ),
                        })}
                    >
                        <BillingPlans />
                    </Provider>
                )
                fireEvent.click(getByTestId('subscription-changed'))
                expect(history.push).toHaveBeenLastCalledWith(
                    '/app/settings/billing'
                )
            })

            it('should redirect to the credit card page if do not have to pay with shopify', () => {
                const {getByTestId} = renderWithRouter(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount?.set(
                                'current_subscription',
                                currentSubscription
                            ),
                        })}
                    >
                        <BillingPlans />
                    </Provider>
                )
                fireEvent.click(getByTestId('subscription-changed'))
                expect(history.push).toHaveBeenLastCalledWith(
                    '/app/settings/billing/add-payment-method'
                )
            })
        }
    )
})
