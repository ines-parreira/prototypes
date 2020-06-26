import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, OrderedMap} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {initialState as initialCurrentAccountState} from '../../currentAccount/reducers'

import * as billingFixtures from '../../../fixtures/billing'

jest.addMatchers(immutableMatchers)

describe('billing selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentAccount: fromJS({
                current_subscription: {plan: 'free'}
            }),
            billing: initialState.mergeDeep(billingFixtures.billingState),
            integrations: fromJS({
                // 6 active integrations to test plan integrations limits
                integrations: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]
            })
        }
    })

    it('getBillingState', () => {
        expect(selectors.getBillingState({})).toEqualImmutable(fromJS({}))
        expect(selectors.getBillingState(state)).toEqualImmutable(state.billing)
    })

    it('plans', () => {
        expect(selectors.plans({})).toEqualImmutable(OrderedMap())

        const plans = selectors.plans(state)

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
        expect(selectors.getPlan('growth-usd-1')(state).get('name')).toBe(state.billing.getIn(['plans', 'growth-usd-1', 'name']))
        expect(selectors.getPlan('standard-1')(state).get('name')).toBe(state.billing.getIn(['plans', 'standard-1', 'name']))
    })

    it('invoices', () => {
        expect(selectors.invoices({})).toEqualImmutable(fromJS([]))
        expect(selectors.invoices(state).size).toBe(1)
    })

    it('contact', () => {
        expect(selectors.getContact({})).toBe(null)
        expect(selectors.getContact(state)).toEqualImmutable(state.billing.get('contact'))
    })

    it('creditCard', () => {
        expect(selectors.creditCard({})).toEqualImmutable(fromJS({}))
        expect(selectors.creditCard(state)).toEqualImmutable(state.billing.get('creditCard'))
    })

    it('paymentMethod', () => {
        expect(selectors.paymentMethod({})).toBe('')
        expect(selectors.paymentMethod(state)).toEqualImmutable(state.billing.get('paymentMethod'))
    })

    it('currentUsage', () => {
        expect(selectors.currentUsage({})).toEqualImmutable(fromJS({}))
        expect(selectors.currentUsage(state)).toEqualImmutable(state.billing.get('currentUsage'))
    })

    it('isAllowedToCreateIntegration', () => {
        expect(selectors.isAllowedToCreateIntegration({})).toBe(false)
        expect(selectors.isAllowedToCreateIntegration({
            ...state,
            currentAccount: initialCurrentAccountState.set('current_subscription', fromJS({plan: 'standard-usd-1'})),
        })).toBe(false)
        expect(selectors.isAllowedToCreateIntegration({
            ...state,
            currentAccount: initialCurrentAccountState.set('current_subscription', fromJS({plan: 'growth-usd-1'})),
        })).toBe(true)
    })

    it('planIntegrations', () => {
        expect(selectors.planIntegrations({})).toBe(0)
        expect(selectors.planIntegrations(state)).toBe(15)
    })

    it('isAllowedToChangePlan', () => {
        expect(selectors.isAllowedToChangePlan()({})).toBe(true)
        expect(selectors.isAllowedToChangePlan('standard-usd-1')(state)).toBe(false)
        expect(selectors.isAllowedToChangePlan('growth-usd-1')(state)).toBe(true)
    })

    describe('currentPlanId()', () => {
        it('should return plan of the current subscription', () => {
            const state = {}
            expect(selectors.currentPlanId(state)).toEqual(undefined)
        })

        it('should return plan of the current subscription', () => {
            const state = {
                currentAccount: fromJS({current_subscription: {plan: 'subscription-plan-123'}}),
                billing: fromJS({futureSubscriptionPlan: 'future-plan-123'})
            }
            expect(selectors.currentPlanId(state)).toEqual('subscription-plan-123')
        })

        it('should return the future subscription plan', () => {
            const state = {
                currentAccount: fromJS({current_subscription: null}),
                billing: fromJS({futureSubscriptionPlan: 'future-plan-123'})
            }
            expect(selectors.currentPlanId(state)).toEqual('future-plan-123')
        })
    })
})
