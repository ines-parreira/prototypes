import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'
import _cloneDeep from 'lodash/cloneDeep'

import {notify} from 'state/notifications/actions'
import {RootState, StoreDispatch} from 'state/types'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPrice,
    customAutomationPrice,
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {updateSubscription} from 'state/currentAccount/actions'
import * as utils from 'utils'
import * as billingSelectors from 'state/billing/selectors'
import BillingPlansComparison from '../BillingPlansComparison'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const notifyMock = notify as jest.MockedFunction<typeof notify>

jest.mock('popper.js')
jest.mock('../../../../../state/currentAccount/actions')
jest.mock('../../../../../state/notifications/actions')
jest.mock('lodash/uniqueId', () => () => '42')

describe('<BillingPlansComparison />', () => {
    const defaultProductPrices: typeof products = _cloneDeep(products)

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
            },
        }),
        billing: fromJS({
            ...billingState,
            products: defaultProductPrices,
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
                        [
                            'current_subscription',
                            'products',
                            HELPDESK_PRODUCT_ID,
                        ],
                        'price_foo'
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
            const helpdeskProduct = defaultProductPrices[0].prices.find(
                (product) => product.interval === interval
            )!

            it(`should render only plans with the selected interval for ${helpdeskProduct.legacy_id} plan`, () => {
                const {queryAllByText} = render(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount?.setIn(
                                [
                                    'current_subscription',
                                    'products',
                                    HELPDESK_PRODUCT_ID,
                                ],
                                helpdeskProduct.price_id
                            ),
                        })}
                    >
                        <BillingPlansComparison {...minProps} />
                    </Provider>
                )
                expect(queryAllByText(/month/)).toHaveLength(
                    interval === PlanInterval.Month ? 6 : 0
                )
                expect(queryAllByText(/year/)).toHaveLength(
                    interval === PlanInterval.Year ? 6 : 0
                )
            })

            it('should change the selected interval on the interval button click', () => {
                const {queryAllByText, getByRole} = render(
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            currentAccount: defaultState.currentAccount?.setIn(
                                [
                                    'current_subscription',
                                    'products',
                                    HELPDESK_PRODUCT_ID,
                                ],
                                helpdeskProduct.price_id
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
                    interval === PlanInterval.Month ? 0 : 6
                )
                expect(queryAllByText(/year/)).toHaveLength(
                    interval === PlanInterval.Year ? 0 : 6
                )
            })
        }
    )

    it('should render a legacy plan', () => {
        const productsWithLegacyPrices = _cloneDeep(products)
        productsWithLegacyPrices[0].prices.push(legacyBasicHelpdeskPrice)
        productsWithLegacyPrices[1].prices.push(legacyBasicAutomationPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        [
                            'current_subscription',
                            'products',
                            HELPDESK_PRODUCT_ID,
                        ],
                        legacyBasicHelpdeskPrice.price_id
                    ),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithLegacyPrices,
                    }),
                })}
            >
                <BillingPlansComparison {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a custom plan', () => {
        const productsWithCustomPrice = _cloneDeep(products)
        productsWithCustomPrice[0].prices.push(customHelpdeskPrice)
        productsWithCustomPrice[1].prices.push(customAutomationPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'products'],
                        fromJS({
                            [HELPDESK_PRODUCT_ID]: customHelpdeskPrice.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                customAutomationPrice.price_id,
                        })
                    ),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithCustomPrice,
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
                name: `Upgrade to ${proMonthlyHelpdeskPrice.name} Plan`,
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
                name: `Upgrade to ${proMonthlyHelpdeskPrice.name} Plan`,
            })
        )
        fireEvent.click(getByRole('button', {name: 'Confirm'}))

        expect(store.getActions()).toMatchSnapshot()
        expect(updateSubscriptionMock).toHaveBeenLastCalledWith({
            plan: proMonthlyHelpdeskPrice.legacy_id,
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
                name: `Upgrade to ${proMonthlyHelpdeskPrice.name} Plan`,
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
                    currentAccount: defaultState.currentAccount?.setIn(
                        ['current_subscription', 'products'],
                        fromJS(automationSubscriptionProductPrices)
                    ),
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
            plan: basicMonthlyAutomationPrice.legacy_id,
        })
    })
})
