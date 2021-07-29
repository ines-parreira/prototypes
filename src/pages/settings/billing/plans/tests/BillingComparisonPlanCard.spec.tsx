import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'

import {Plan, PlanInterval} from '../../../../../models/billing/types'
import {
    basicPlan,
    proPlan,
    customPlan,
    legacyPlan,
    customLegacyPlan,
    advancedPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {account} from '../../../../../fixtures/account'
import * as billingSelectors from '../../../../../state/billing/selectors'
import BillingComparisonPlanCard from '../BillingComparisonPlanCard'

jest.mock('popper.js')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<BillingComparisonPlanCard />', () => {
    let getCurrentPlanSpy: jest.SpyInstance
    let getHasLegacyPlan: jest.SpyInstance
    const plans = [basicPlan, advancedPlan, proPlan].reduce((acc, plan) => {
        const monthlyId = `${plan.name.toLowerCase()}-monthly`
        const yearlyId = `${plan.name.toLowerCase()}-yearly`
        return [
            ...acc,
            {
                ...plan,
                id: monthlyId,
                interval: PlanInterval.Month,
            },
            {
                ...plan,
                id: yearlyId,
                interval: PlanInterval.Year,
            },
        ]
    }, [] as Plan[])

    beforeEach(() => {
        jest.resetAllMocks()
        getCurrentPlanSpy = jest.spyOn(billingSelectors, 'getCurrentPlan')
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(basicPlan) as Map<any, any>
        )
        getHasLegacyPlan = jest.spyOn(billingSelectors, 'hasLegacyPlan')
        getHasLegacyPlan.mockImplementation(() => false)
    })

    afterEach(() => {
        getCurrentPlanSpy.mockRestore()
        getHasLegacyPlan.mockRestore()
    })

    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
    }
    const onPlanChangeMock = jest.fn()
    const minProps: ComponentProps<typeof BillingComparisonPlanCard> = {
        plan: {...basicPlan, currencySign: '$'},
        isCurrentPlan: false,
        isUpdating: false,
        onPlanChange: onPlanChangeMock,
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
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(legacyPlan) as Map<any, any>
        )
        const {container} = render(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        ...account,
                        meta: {has_legacy_features: true},
                    }),
                })}
            >
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPlan
                    plan={{...legacyPlan, currencySign: '$'}}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        ['custom', customPlan],
        ['customLegacyPlan', customLegacyPlan],
    ])('should render %s plan', (testName, plan) => {
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(plan) as Map<any, any>
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    isCurrentPlan
                    plan={{...plan, currencySign: '$'}}
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
                <BillingComparisonPlanCard
                    {...minProps}
                    plan={{...proPlan, currencySign: '$'}}
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
        getCurrentPlanSpy.mockImplementation(
            () => fromJS(proPlan) as Map<any, any>
        )
        const {getByRole, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingComparisonPlanCard
                    {...minProps}
                    plan={{...basicPlan, currencySign: '$'}}
                />
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
            getCurrentPlanSpy.mockImplementation(
                () => fromJS({...proPlan, id: 'pro-monthly'}) as Map<any, any>
            )

            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <BillingComparisonPlanCard
                        {...minProps}
                        plan={{...(plan as Plan), currencySign: '$'}}
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
            getCurrentPlanSpy.mockImplementation(
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
                        plan={{...(plan as Plan), currencySign: '$'}}
                        defaultIsPlanChangeModalOpen={true}
                    />
                </Provider>
            )

            expect(getAllByText(new RegExp(text as string, 'i'))).toBeTruthy()
            expect(getByText('Switch to our updated plans')).toBeTruthy()
        }
    )
})
