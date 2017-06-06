import {createSelector} from 'reselect'
import {fromJS} from 'immutable'
import {getActiveIntegrations} from '../integrations/selectors'

const DEFAULT_PLAN = 'standard-usd-1'

export const getBillingState = (state) => state.billing || fromJS({})

export const currentPlanId = createSelector(
    [getBillingState],
    state => state.get('currentPlanId') || DEFAULT_PLAN
)

export const plans = createSelector(
    [getBillingState],
    state => {
        return state.get('plans', fromJS({}))
            .sortBy(p => p.get('order') || Infinity)
            .map(plan => {
                const amount = plan.get('amount') || 0
                return plan
                    .set('amount', amount / 100) // stripe amount are in cents
                    .set('currencySign', '$') // we only have USD today, change this when we add more currencies
            })
    }
)

export const currentPlan = createSelector(
    [plans, currentPlanId],
    (p, id) => p.get(id) || fromJS({})
)

export const getPlan = (planId) => createSelector(
    [plans],
    (p) => p.get(planId) || fromJS({})
)

export const invoices = createSelector(
    [getBillingState],
    billing => billing.get('invoices') || fromJS([])
        .filter((invoice) => invoice.get('attempted') && invoice.get('amount_due') > 0)
)

export const creditCard = createSelector(
    [getBillingState],
    billing => billing.get('creditCard') || fromJS([])
)

export const paymentMethod = createSelector(
    [getBillingState],
    billing => billing.get('paymentMethod') || fromJS([])
)

export const currentUsage = createSelector(
    [getBillingState],
    billing => billing.get('currentUsage') || fromJS([])
)

export const isAllowedToCreateIntegration = createSelector(
    [currentPlan, getActiveIntegrations],
    (plan, activeIntegrations) => {
        return plan.get('integrations', 0) > activeIntegrations.size
    }
)

const isAllowedToChangePlan = (planId) => createSelector(
    [getPlan(planId), getActiveIntegrations],
    (plan, activeIntegrations) => {
        return plan.get('integrations', 0) >= activeIntegrations.size
    }
)

export const makeIsAllowedToChangePlan = (state) => (planId) => isAllowedToChangePlan(planId)(state)
