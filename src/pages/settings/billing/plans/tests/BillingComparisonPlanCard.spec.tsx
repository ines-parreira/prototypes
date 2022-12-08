import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _cloneDeep from 'lodash/cloneDeep'

import {HelpdeskPrice} from 'models/billing/types'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    customAutomationPrice,
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import BillingComparisonPlanCard from '../BillingComparisonPlanCard'

jest.mock('popper.js')
jest.mock('lodash/uniqueId', () => () => '42')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<BillingComparisonPlanCard />', () => {
    const prices = [
        basicMonthlyHelpdeskPrice,
        advancedMonthlyHelpdeskPrice,
        proMonthlyHelpdeskPrice,
    ]

    const stateProducts = _cloneDeep(products)
    stateProducts[0].prices.push(legacyBasicHelpdeskPrice)
    stateProducts[0].prices.push(customHelpdeskPrice)
    stateProducts[1].prices.push(legacyBasicAutomationPrice)
    stateProducts[1].prices.push(customAutomationPrice)

    beforeEach(() => {
        jest.resetAllMocks()
    })

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
                products: {
                    [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPrice.price_id,
                },
            },
        }),
        billing: fromJS({
            ...billingState,
            products: stateProducts,
        }),
    }
    const onPriceChangeMock = jest.fn()
    const minProps: ComponentProps<typeof BillingComparisonPlanCard> = {
        helpdeskPrice: basicMonthlyHelpdeskPrice,
        isCurrentPrice: false,
        isUpdating: false,
        onPriceChange: onPriceChangeMock,
        isAutomationChecked: false,
        onAutomationChange: jest.fn(),
    }

    it('should render current plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} isCurrentPrice />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current legacy plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPrice
                    helpdeskPrice={legacyBasicHelpdeskPrice}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        ['custom', customHelpdeskPrice],
        [
            'customLegacyPlan',
            {
                ...customHelpdeskPrice,
                is_legacy: true,
            },
        ],
    ])('should render %s plan', (testName, price) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPrice
                    helpdeskPrice={price}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render plan as current plan', () => {
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
                        basicMonthlyHelpdeskPrice.price_id
                    ),
                })}
            >
                <BillingComparisonPlanCard {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render spinner when plan is updating', () => {
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
                        basicMonthlyHelpdeskPrice.price_id
                    ),
                })}
            >
                <BillingComparisonPlanCard {...minProps} isUpdating={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the initial plan change modal comparison', () => {
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    defaultIsPriceChangeModalOpen={true}
                />
            </Provider>
        )

        expect(getByRole('dialog')).toBeTruthy()
    })

    it('should render the plan upgrade modal comparison', () => {
        const {getByRole, getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: defaultState.currentAccount?.setIn(
                        [
                            'current_subscription',
                            'products',
                            HELPDESK_PRODUCT_ID,
                        ],
                        basicMonthlyHelpdeskPrice.price_id
                    ),
                })}
            >
                <BillingComparisonPlanCard
                    {...minProps}
                    helpdeskPrice={proMonthlyHelpdeskPrice}
                />
            </Provider>
        )
        fireEvent.click(getByRole('button', {name: 'Upgrade to Pro Plan'}))
        expect(
            getByText(
                /Our Pro plan was defined for growing businesses like yours/
            )
        ).toBeTruthy()
    })

    it('should render the plan downgrade modal comparison', () => {
        const {getByRole, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    helpdeskPrice={basicMonthlyHelpdeskPrice}
                />
            </Provider>
        )
        fireEvent.click(getByRole('button', {name: 'Downgrade to Basic Plan'}))
        expect(
            getByText(/Note that your number of tickets will decrease from/)
        ).toBeTruthy()
    })

    it.each(
        prices.map((price) => {
            if (price.name === 'Basic') {
                return [price, 'Downgrade']
            } else if (price.name === 'Pro') {
                return [price, 'Switch']
            }
            return [price, 'Upgrade']
        }) as unknown as [HelpdeskPrice, string][]
    )(
        'should render expected comparison on modal with plan %s',
        (price, text) => {
            const {getByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                status: 'active',
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        proMonthlyHelpdeskPrice.price_id,
                                },
                            },
                        }),
                    })}
                >
                    <BillingComparisonPlanCard
                        {...minProps}
                        helpdeskPrice={price}
                        defaultIsPriceChangeModalOpen={true}
                    />
                </Provider>
            )

            expect(getByText(new RegExp(text, 'i'))).toBeTruthy()
        }
    )

    it.each(
        prices.map((price) => {
            if (price.name === 'Basic' || price.name === 'Pro') {
                return [price, 'Switch']
            }
            return [price, 'Upgrade']
        }) as unknown as [HelpdeskPrice, string][]
    )(
        'should render expected comparison on modal between current legacy plan and %s plan',
        (price, text) => {
            const {getAllByText, getByText} = render(
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
                    })}
                >
                    <BillingComparisonPlanCard
                        {...minProps}
                        helpdeskPrice={price}
                        defaultIsPriceChangeModalOpen={true}
                    />
                </Provider>
            )

            expect(getAllByText(new RegExp(text, 'i'))).toBeTruthy()
            expect(getByText('Switch to our updated plans')).toBeTruthy()
        }
    )

    it('should render the automation plan features when the automation checkbox is checked', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isAutomationChecked
                    defaultIsPriceChangeModalOpen
                />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })
})
