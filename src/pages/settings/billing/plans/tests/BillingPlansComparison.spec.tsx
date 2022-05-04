import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {notify} from '../../../../../state/notifications/actions'
import BillingPlansComparison from '../BillingPlansComparison'
import {
    advancedPlan,
    basicPlan,
    legacyPlan,
    proPlan,
    basicAutomationPlan,
    proAutomationPlan,
    advancedAutomationPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {account} from '../../../../../fixtures/account'
import {billingState} from '../../../../../fixtures/billing'
import {Plan, PlanInterval} from '../../../../../models/billing/types'
import * as utils from '../../../../../utils'
import * as billingSelectors from '../../../../../state/billing/selectors'
import {updateSubscription} from '../../../../../state/currentAccount/actions'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const notifyMock = notify as jest.MockedFunction<typeof notify>

jest.mock('popper.js')
jest.mock('../../../../../state/currentAccount/actions')
jest.mock('../../../../../state/notifications/actions')
jest.mock('lodash/uniqueId', () => () => '42')

describe('<BillingPlansComparison />', () => {
    const defaultPlans = [
        basicPlan,
        advancedPlan,
        proPlan,
        basicAutomationPlan,
        proAutomationPlan,
        advancedAutomationPlan,
    ].reduce((acc, plan) => {
        let monthlyId
        let yearlyId
        if (plan.automation_addon_included) {
            monthlyId = `${plan.name.toLowerCase()}-automation-monthly`
            yearlyId = `${plan.name.toLowerCase()}-automation-yearly`
        } else {
            monthlyId = `${plan.name.toLowerCase()}-monthly`
            yearlyId = `${plan.name.toLowerCase()}-yearly`
        }
        return {
            ...acc,
            [monthlyId]: {
                ...plan,
                id: monthlyId,
                interval: PlanInterval.Month,
                automation_addon_equivalent_plan: plan.automation_addon_included
                    ? `${plan.name.toLowerCase()}-monthly`
                    : `${plan.name.toLowerCase()}-automation-monthly`,
            },
            [yearlyId]: {
                ...plan,
                id: yearlyId,
                interval: PlanInterval.Year,
                automation_addon_equivalent_plan: plan.automation_addon_included
                    ? `${plan.name.toLowerCase()}-yearly`
                    : `${plan.name.toLowerCase()}-automation-yearly`,
            },
        }
    }, {} as Partial<Record<string, Plan>>)

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: Object.values(defaultPlans)[0]!.id,
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: defaultPlans,
        }),
    }
    const minProps: ComponentProps<typeof BillingPlansComparison> = {
        onSubscriptionChanged: jest.fn(),
    }

    const updateSubscriptionMock = updateSubscription as jest.MockedFunction<
        typeof updateSubscription
    >
    let openChatSpy: jest.SpyInstance
    let makeIsAllowedToChangePlanSpy: jest.SpyInstance
    beforeEach(() => {
        jest.clearAllMocks()
        openChatSpy = jest.spyOn(utils, 'openChat')
        makeIsAllowedToChangePlanSpy = jest.spyOn(
            billingSelectors,
            'makeIsAllowedToChangePlan'
        )
        makeIsAllowedToChangePlanSpy.mockImplementation(() => () => true)
        updateSubscriptionMock.mockImplementation(() => () => Promise.resolve())
    })

    afterEach(() => {
        openChatSpy.mockRestore()
        makeIsAllowedToChangePlanSpy.mockRestore()
    })

    it('should render available plans', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'plan'],
                        'some-unknown-plan'
                    ),
                })}
            >
                <BillingPlansComparison {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    describe.each<PlanInterval>(Object.values(PlanInterval))(
        '%s interval',
        (interval) => {
            const monthlyPlans = (Object.values(defaultPlans) as Plan[]).filter(
                (plan) =>
                    plan.interval === PlanInterval.Month &&
                    !plan.automation_addon_included
            )
            const yearlyPlans = (Object.values(defaultPlans) as Plan[]).filter(
                (plan) =>
                    plan.interval === PlanInterval.Year &&
                    !plan.automation_addon_included
            )
            const currentPlan = (Object.values(defaultPlans) as Plan[]).find(
                (plan) => plan.interval === interval
            )

            it(`should render only plans with the selected interval for ${
                currentPlan!.id
            } plan`, () => {
                const {queryAllByText} = render(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount?.setIn(
                                ['current_subscription', 'plan'],
                                currentPlan!.id
                            ),
                        })}
                    >
                        <BillingPlansComparison {...minProps} />
                    </Provider>
                )
                expect(queryAllByText(/month/)).toHaveLength(
                    interval === PlanInterval.Month
                        ? monthlyPlans.length * 2
                        : 0
                )
                expect(queryAllByText(/year/)).toHaveLength(
                    interval === PlanInterval.Year ? yearlyPlans.length * 2 : 0
                )
            })

            it('should change the selected interval on the interval button click', () => {
                const {queryAllByText, getByRole} = render(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount?.setIn(
                                ['current_subscription', 'plan'],
                                currentPlan!.id
                            ),
                        })}
                    >
                        <BillingPlansComparison {...minProps} />
                    </Provider>
                )
                fireEvent.click(
                    getByRole('button', {
                        name: `${
                            interval === PlanInterval.Month
                                ? 'Yearly'
                                : 'Monthly'
                        } interval`,
                    })
                )

                expect(queryAllByText(/month/)).toHaveLength(
                    interval === PlanInterval.Month
                        ? 0
                        : monthlyPlans.length * 2
                )
                expect(queryAllByText(/year/)).toHaveLength(
                    interval === PlanInterval.Year ? 0 : yearlyPlans.length * 2
                )
            })
        }
    )

    it('should render a legacy plan', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'plan'],
                        legacyPlan.id
                    ),
                    billing: fromJS({
                        ...billingState,
                        plans: {
                            ...defaultPlans,
                            [legacyPlan.id]: {
                                ...legacyPlan,
                                legacy_features: legacyPlan.features,
                            },
                        },
                    }),
                })}
            >
                <BillingPlansComparison {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display notification when not allowed to change plan on plan change', () => {
        makeIsAllowedToChangePlanSpy.mockImplementation(() => () => false)
        const store = mockStore(defaultState)
        const {getByRole} = render(
            <Provider store={store}>
                <BillingPlansComparison {...minProps} />
            </Provider>
        )

        fireEvent.click(
            getByRole('button', {
                name: `Upgrade to ${defaultPlans['pro-monthly']!.name} Plan`,
            })
        )
        fireEvent.click(getByRole('button', {name: 'Confirm'}))

        expect(notifyMock.mock.calls).toMatchSnapshot()
    })

    it('should update subscription and call onSubscriptionChange callback on plan change ', async () => {
        const store = mockStore(defaultState)
        const {getByRole} = render(
            <Provider store={store}>
                <BillingPlansComparison {...minProps} />
            </Provider>
        )

        fireEvent.click(
            getByRole('button', {
                name: `Upgrade to ${defaultPlans['pro-monthly']!.name} Plan`,
            })
        )
        fireEvent.click(getByRole('button', {name: 'Confirm'}))

        expect(store.getActions()).toMatchSnapshot()
        expect(updateSubscriptionMock).toHaveBeenLastCalledWith({
            plan: defaultPlans['pro-monthly']!.id,
        })
        await waitFor(() => {
            expect(minProps.onSubscriptionChanged).toHaveBeenLastCalledWith(
                defaultState.currentAccount?.get('current_subscription')
            )
        })
    })

    it('should set plan cards to updating while plan is being updated', () => {
        updateSubscriptionMock.mockImplementation(
            () => () => new Promise(_noop)
        )
        const {getByRole, container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlansComparison {...minProps} />
            </Provider>
        )

        fireEvent.click(
            getByRole('button', {
                name: `Upgrade to ${defaultPlans['pro-monthly']!.name} Plan`,
            })
        )
        fireEvent.click(getByRole('button', {name: 'Confirm'}))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display disabled link to modal for current plan with automation add-on', () => {
        const {getAllByLabelText, getByRole, container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            plan: `basic-automation-monthly`,
                        },
                    }),
                })}
            >
                <BillingPlansComparison {...minProps} />
            </Provider>
        )

        fireEvent.click(getAllByLabelText(/Automation/)[0])
        expect(container.firstChild).toMatchSnapshot()

        expect(getByRole('button', {name: 'Current Plan'})).toMatchSnapshot()
    })

    it('should update current plan without automation add-on to same plan with add-on', () => {
        const {getAllByLabelText, getByText, getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingPlansComparison {...minProps} />
            </Provider>
        )
        fireEvent.click(getAllByLabelText(/Automation/)[0])

        fireEvent.click(getByRole('button', {name: 'Add to Plan'}))
        expect(
            getByText(/track their orders, request a return or a cancel/)
        ).toBeTruthy()

        fireEvent.click(getByRole('button', {name: 'Confirm'}))
        expect(updateSubscriptionMock).toHaveBeenLastCalledWith({
            plan: defaultPlans['basic-monthly']!.id.replace(
                /\-/,
                '-automation-'
            ),
        })
    })
})
