import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, OrderedMap} from 'immutable'

import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'
import {initialState as initialCurrentAccountState} from '../../currentAccount/reducers.ts'

import * as billingFixtures from '../../../fixtures/billing.ts'

jest.addMatchers(immutableMatchers)

describe('billing selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentAccount: fromJS({
                current_subscription: {plan: 'free'},
            }),
            billing: initialState.mergeDeep(billingFixtures.billingState),
            integrations: fromJS({
                // 6 active integrations to test plan integrations limits
                integrations: [
                    {id: 1},
                    {id: 2},
                    {id: 3},
                    {id: 4},
                    {id: 5},
                    {id: 6},
                ],
            }),
        }
    })

    it('getBillingState', () => {
        expect(selectors.getBillingState({})).toEqualImmutable(fromJS({}))
        expect(selectors.getBillingState(state)).toEqualImmutable(state.billing)
    })

    it('plans', () => {
        expect(selectors.getPlans({})).toEqualImmutable(OrderedMap())

        const plans = selectors.getPlans(state)

        expect(state.billing.get('plans').size).toBe(plans.size)

        plans.forEach((plan) => {
            const planJS = plan.toJS()
            expect(planJS).toHaveProperty('amount')
            expect(planJS).toHaveProperty('currencySign')
        })
    })

    it('getPlan', () => {
        expect(selectors.getPlan()({})).toEqualImmutable(fromJS({}))
        expect(selectors.getPlan()(state)).toEqualImmutable(fromJS({}))
        expect(selectors.getPlan('growth-usd-1')(state).get('name')).toBe(
            state.billing.getIn(['plans', 'growth-usd-1', 'name'])
        )
        expect(selectors.getPlan('standard-1')(state).get('name')).toBe(
            state.billing.getIn(['plans', 'standard-1', 'name'])
        )
    })

    it('invoices', () => {
        expect(selectors.invoices({})).toEqualImmutable(fromJS([]))
        expect(selectors.invoices(state).size).toBe(1)
    })

    it('contact', () => {
        expect(selectors.getContact({})).toBe(null)
        expect(selectors.getContact(state)).toEqualImmutable(
            state.billing.get('contact')
        )
    })

    it('creditCard', () => {
        expect(selectors.creditCard({})).toEqualImmutable(fromJS({}))
        expect(selectors.creditCard(state)).toEqualImmutable(
            state.billing.get('creditCard')
        )
    })

    it('paymentMethod', () => {
        expect(selectors.paymentMethod({})).toBe('')
        expect(selectors.paymentMethod(state)).toEqualImmutable(
            state.billing.get('paymentMethod')
        )
    })

    it('currentUsage', () => {
        expect(selectors.getCurrentUsage({})).toEqualImmutable(fromJS({}))
        expect(selectors.getCurrentUsage(state)).toEqualImmutable(
            state.billing.get('currentUsage')
        )
    })

    it('isAllowedToCreateIntegration', () => {
        expect(selectors.isAllowedToCreateIntegration({})).toBe(false)
        expect(
            selectors.isAllowedToCreateIntegration({
                ...state,
                currentAccount: initialCurrentAccountState.set(
                    'current_subscription',
                    fromJS({plan: 'standard-usd-1'})
                ),
            })
        ).toBe(false)
        expect(
            selectors.isAllowedToCreateIntegration({
                ...state,
                currentAccount: initialCurrentAccountState.set(
                    'current_subscription',
                    fromJS({plan: 'growth-usd-1'})
                ),
            })
        ).toBe(true)
    })

    it('planIntegrations', () => {
        expect(selectors.planIntegrations({})).toBe(0)
        expect(selectors.planIntegrations(state)).toBe(15)
    })

    it('isAllowedToChangePlan', () => {
        expect(selectors.isAllowedToChangePlan()({})).toBe(true)
        expect(selectors.isAllowedToChangePlan('standard-usd-1')(state)).toBe(
            false
        )
        expect(selectors.isAllowedToChangePlan('growth-usd-1')(state)).toBe(
            true
        )
    })

    describe('accountHasLegacyPlan', () => {
        it('should return the proper value for a legacy and non legacy plan', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: 'growth-usd-1'},
                }),
            }
            expect(selectors.hasLegacyPlan(state)).toBe(false)
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: 'growth-usd-1'},
                    meta: {has_legacy_features: true},
                }),
            }
            expect(selectors.hasLegacyPlan(state)).toBe(true)
        })

        it('should return false when the current plan is empty', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: null,
                }),
            }
            expect(selectors.hasLegacyPlan(state)).toBe(false)
        })
    })

    describe('currentPlanId()', () => {
        it('should return undefined when no current subscription', () => {
            const state = {}
            expect(selectors.currentPlanId(state)).toEqual(undefined)
        })

        it('should return plan of the current subscription', () => {
            const state = {
                currentAccount: fromJS({
                    current_subscription: {plan: 'subscription-plan-123'},
                }),
                billing: fromJS({futureSubscriptionPlan: 'future-plan-123'}),
            }
            expect(selectors.currentPlanId(state)).toEqual(
                'subscription-plan-123'
            )
        })

        it('should return the future subscription plan', () => {
            const state = {
                currentAccount: fromJS({current_subscription: null}),
                billing: fromJS({futureSubscriptionPlan: 'future-plan-123'}),
            }
            expect(selectors.currentPlanId(state)).toEqual('future-plan-123')
        })
    })

    describe('getEquivalentAutomationCurrentPlan()', () => {
        const regularPlan = 'pro-monthly-usd-2'
        const automationPlan = 'pro-automation-monthly-usd-2'

        it('should return undefined when no current plan', () => {
            const state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: null,
                }),
            }
            expect(selectors.getEquivalentAutomationCurrentPlan(state)).toBe(
                undefined
            )
        })

        it('should return automation plan when current plan is regular', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: regularPlan},
                }),
            }
            expect(
                selectors.getEquivalentAutomationCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return automation plan when current plan is also automation', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: automationPlan},
                }),
            }
            expect(
                selectors.getEquivalentAutomationCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getEquivalentRegularCurrentPlan()', () => {
        const regularPlan = 'pro-monthly-usd-2'
        const automationPlan = 'pro-automation-monthly-usd-2'

        it('should return undefined when no current plan', () => {
            const state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: null,
                }),
            }
            expect(selectors.getEquivalentRegularCurrentPlan(state)).toBe(
                undefined
            )
        })

        it('should return regular plan when current plan is also regular', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: regularPlan},
                }),
            }
            expect(
                selectors.getEquivalentRegularCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return regular plan when current plan is automation', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: automationPlan},
                }),
            }
            expect(
                selectors.getEquivalentRegularCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getAddOnAutomationAmountCurrentPlan()', () => {
        it('should return the amount of automation add-on', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {plan: 'pro-monthly-usd-2'},
                }),
            }
            expect(
                selectors.getAddOnAutomationAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return undefined when equivalent plan does not exist', () => {
            state = {
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    plans: {},
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        plan: 'pro-automation-monthly-usd-2',
                    },
                }),
            }
            expect(
                selectors.getAddOnAutomationAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getHasAutomationAddOn()', () => {
        it('should return true', () => {
            expect(
                selectors.getHasAutomationAddOn({
                    ...state,
                    currentAccount: fromJS({
                        current_subscription: {
                            plan: 'pro-automation-monthly-usd-2',
                        },
                    }),
                })
            ).toBeTruthy()
        })

        it('should return false', () => {
            expect(selectors.getHasAutomationAddOn(state)).toBeFalsy()
        })
    })
})
