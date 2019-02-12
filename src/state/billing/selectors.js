// @flow
import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

import {getActiveIntegrations} from '../integrations/selectors'

// types
import type {stateType} from '../types'
import {getCurrentAccountState} from '../currentAccount/selectors'

export const DEFAULT_PLAN = 'standard-usd-1'

export const getBillingState = (state: stateType) => state.billing || fromJS({})

export const currentPlanId = createSelector(
    [getCurrentAccountState],
    (state) => state.getIn(['current_subscription', 'plan'])
)

export const plans = createSelector(
    [getBillingState],
    (state) => {
        return state.get('plans', fromJS({}))
            .sortBy((plan) => plan.get('order') || Infinity)
            .map((plan) => {
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

export const getPlan = (planId: string) => createSelector(
    [plans],
    (p) => p.get(planId) || fromJS({})
)

export const invoices = createSelector(
    [getBillingState],
    (billing) => billing.get('invoices', fromJS([]))
        .filter((invoice) => invoice.get('attempted') && invoice.get('amount_due') > 0)
)

export const creditCard = createSelector(
    [getBillingState],
    (billing) => billing.get('creditCard') || fromJS({})
)

export const paymentMethod = createSelector(
    [getBillingState],
    (billing) => billing.get('paymentMethod') || ''
)

export const currentUsage = createSelector(
    [getBillingState],
    (billing) => billing.get('currentUsage') || fromJS({})
)

export const planIntegrations = createSelector(
    [currentPlan],
    (plan) => plan.get('integrations', 0)
)

export const isAllowedToCreateIntegration = createSelector(
    [planIntegrations, getActiveIntegrations],
    (integrations, activeIntegrations) => {
        return integrations > activeIntegrations.size
    }
)

export const isAllowedToChangePlan = (planId: string) => createSelector(
    [getPlan(planId), getActiveIntegrations],
    (plan, activeIntegrations) => {
        return plan.get('integrations', 0) >= activeIntegrations.size
    }
)

export const makeIsAllowedToChangePlan = (state: stateType) => (planId: string) => isAllowedToChangePlan(planId)(state)
