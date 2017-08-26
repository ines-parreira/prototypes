import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, OrderedMap} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

import * as billingFixtures from '../../../fixtures/billing'

jest.addMatchers(immutableMatchers)

describe('billing selectors', () => {
    let state

    beforeEach(() => {
        state = {
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

    it('currentPlanId', () => {
        expect(selectors.currentPlanId({})).toBe(selectors.DEFAULT_PLAN)
        expect(selectors.currentPlanId(state)).toBe(state.billing.get('currentPlanId'))
    })

    it('plans', () => {
        expect(selectors.plans({})).toEqualImmutable(OrderedMap())

        const plans = selectors.plans(state)

        expect(state.billing.get('plans').size).toBe(plans.size)

        plans.forEach((plan) => {
            plan = plan.toJS()
            expect(plan).toHaveProperty('amount')
            expect(plan).toHaveProperty('currencySign')
        })
    })

    it('currentPlan', () => {
        expect(selectors.currentPlan({})).toEqualImmutable(fromJS({}))

        const currentPlan = selectors.currentPlan(state)
        expect(currentPlan.get('name')).toBe(state.billing.getIn(['plans', 'team-usd-1', 'name']))
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
            billing: state.billing.set('currentPlanId', 'standard-usd-1'),
        })).toBe(false)
        expect(selectors.isAllowedToCreateIntegration({
            ...state,
            billing: state.billing.set('currentPlanId', 'growth-usd-1'),
        })).toBe(true)
    })

    it('isAllowedToChangePlan', () => {
        expect(selectors.isAllowedToChangePlan()({})).toBe(true)
        expect(selectors.isAllowedToChangePlan('standard-usd-1')(state)).toBe(false)
        expect(selectors.isAllowedToChangePlan('growth-usd-1')(state)).toBe(true)
    })
})
