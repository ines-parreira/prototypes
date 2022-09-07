import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import _cloneDeep from 'lodash/cloneDeep'

import {createHelpdeskPlanFromProducts} from 'models/billing/utils'
import {Plan} from 'models/billing/types'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
    proMonthlyHelpdeskPrice,
    transitoryPlans,
} from 'fixtures/productPrices'
import * as billingSelectors from 'state/billing/selectors'
import {PlanWithCurrencySign} from 'state/billing/types'
import BillingComparisonPlanCard from '../BillingComparisonPlanCard'

jest.mock('popper.js')
jest.mock('lodash/uniqueId', () => () => '42')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<BillingComparisonPlanCard />', () => {
    let DEPRECATED_getCurrentPlanSpy: jest.SpyInstance
    let getHasLegacyPlan: jest.SpyInstance

    const {basicPlan, proPlan, advancedPlan} = transitoryPlans
    const plans = [basicPlan, advancedPlan, proPlan]

    const stateProducts = _cloneDeep(products)
    stateProducts[0].prices.push(legacyBasicHelpdeskPrice)
    stateProducts[1].prices.push(legacyBasicAutomationPrice)

    beforeEach(() => {
        jest.resetAllMocks()
        DEPRECATED_getCurrentPlanSpy = jest.spyOn(
            billingSelectors,
            'DEPRECATED_getCurrentPlan'
        )
        DEPRECATED_getCurrentPlanSpy.mockImplementation(
            () => fromJS(basicPlan) as Map<any, any>
        )
        getHasLegacyPlan = jest.spyOn(billingSelectors, 'hasLegacyPlan')
        getHasLegacyPlan.mockImplementation(() => false)
    })

    afterEach(() => {
        DEPRECATED_getCurrentPlanSpy.mockRestore()
        getHasLegacyPlan.mockRestore()
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
    const onPlanChangeMock = jest.fn()
    const minProps: ComponentProps<typeof BillingComparisonPlanCard> = {
        plan: transitoryPlans.basicPlan,
        isCurrentPlan: false,
        isUpdating: false,
        onPlanChange: onPlanChangeMock,
        isAutomationChecked: false,
        onAutomationChange: jest.fn(),
    }

    it('should render current plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} isCurrentPlan />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current legacy plan', () => {
        const legacyPlan = transitoryPlans.legacyPlan
        DEPRECATED_getCurrentPlanSpy.mockImplementation(
            () => fromJS(legacyPlan) as Map<any, any>
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPlan
                    plan={legacyPlan}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        ['custom', transitoryPlans.customPlan],
        [
            'customLegacyPlan',
            createHelpdeskPlanFromProducts({
                ...customHelpdeskPrice,
                is_legacy: true,
            }),
        ],
    ])('should render %s plan', (testName, plan) => {
        DEPRECATED_getCurrentPlanSpy.mockImplementation(
            () => fromJS(plan) as Map<any, any>
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPlan
                    plan={plan}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render plan as current plan', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render spinner when plan is updating', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
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
                    defaultIsPlanChangeModalOpen={true}
                />
            </Provider>
        )

        expect(getByRole('dialog')).toBeTruthy()
    })

    it('should render the plan upgrade modal comparison', () => {
        const {getByRole, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} plan={proPlan} />
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
        DEPRECATED_getCurrentPlanSpy.mockImplementation(
            () => fromJS(proPlan) as Map<any, any>
        )
        const {getByRole, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard {...minProps} plan={basicPlan} />
            </Provider>
        )
        fireEvent.click(getByRole('button', {name: 'Downgrade to Basic Plan'}))
        expect(
            getByText(/Note that your number of tickets will decrease from/)
        ).toBeTruthy()
    })

    it.each(
        plans.map((plan: Plan) => {
            if (plan.name === 'Basic') {
                return [plan, 'Downgrade']
            } else if (plan.name === 'Pro') {
                return [plan, 'Switch']
            }
            return [plan, 'Upgrade']
        })
    )(
        'should render expected comparison on modal with plan %s',
        (plan, text) => {
            DEPRECATED_getCurrentPlanSpy.mockImplementation(
                () => fromJS({...proPlan, id: 'pro-monthly'}) as Map<any, any>
            )
            const getEquivalentRegularCurrentPlanSpy = jest.spyOn(
                billingSelectors,
                'getEquivalentRegularCurrentPlan'
            )
            getEquivalentRegularCurrentPlanSpy.mockImplementation(
                () => fromJS({...proPlan, id: 'pro-monthly'}) as Map<any, any>
            )

            const {getByText} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                status: 'active',
                            },
                        }),
                    })}
                >
                    <BillingComparisonPlanCard
                        {...minProps}
                        plan={plan as PlanWithCurrencySign}
                        defaultIsPlanChangeModalOpen={true}
                    />
                </Provider>
            )

            expect(getByText(new RegExp(text as string, 'i'))).toBeTruthy()
        }
    )

    it.each(
        plans.map((plan: Plan) => {
            if (plan.name === 'Basic' || plan.name === 'Pro') {
                return [plan, 'Switch']
            }
            return [plan, 'Upgrade']
        })
    )(
        'should render expected comparison on modal between current legacy plan and %s plan',
        (plan, text) => {
            DEPRECATED_getCurrentPlanSpy.mockImplementation(
                () =>
                    fromJS({
                        ...proPlan,
                        id: 'pro-monthly',
                        public: 'false',
                    }) as Map<any, any>
            )
            getHasLegacyPlan.mockImplementation(() => true)

            const {getAllByText, getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <BillingComparisonPlanCard
                        {...minProps}
                        plan={plan as PlanWithCurrencySign}
                        defaultIsPlanChangeModalOpen={true}
                    />
                </Provider>
            )

            expect(getAllByText(new RegExp(text as string, 'i'))).toBeTruthy()
            expect(getByText('Switch to our updated plans')).toBeTruthy()
        }
    )

    it('should render the automation plan features when the automation checkbox is checked', () => {
        DEPRECATED_getCurrentPlanSpy.mockImplementation(
            () => fromJS(proPlan) as Map<any, any>
        )
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isAutomationChecked
                    defaultIsPlanChangeModalOpen
                />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })
})
