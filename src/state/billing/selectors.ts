import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'

import {getActiveIntegrations} from '../integrations/selectors'

import {RootState} from '../types'
import {getCurrentAccountState} from '../currentAccount/selectors'
import {CurrentAccountState} from '../currentAccount/types'

import {BillingState} from './types'

export const DEFAULT_PLAN = 'standard-usd-1'

export const getBillingState = (state: RootState): BillingState =>
    state.billing || fromJS({})

export const currentPlanId = createSelector<
    RootState,
    string,
    CurrentAccountState,
    BillingState
>(
    getCurrentAccountState as (state: RootState) => CurrentAccountState,
    getBillingState,
    (currentAccountState, billingState) => {
        return (currentAccountState.getIn(['current_subscription', 'plan']) ||
            billingState.get('futureSubscriptionPlan')) as string
    }
)

export const getPlans = createSelector<RootState, Map<any, any>, BillingState>(
    getBillingState,
    (state) => {
        return ((state.get('plans', fromJS({})) as Map<any, any>).sortBy(
            (plan: Map<any, any>) => (plan.get('order') as number) || Infinity
        ) as Map<any, any>).map((plan: Map<any, any>) => {
            const amount = (plan.get('amount') as number) || 0
            return plan
                .set('amount', amount / 100) // stripe amount are in cents
                .set('currencySign', '$') // we only have USD today, change this when we add more currencies
        }) as Map<any, any>
    }
)

export const getCurrentPlan = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>,
    string
>(
    getPlans,
    currentPlanId,
    (p, id) => (p.get(id) as Map<any, any>) || fromJS({})
)

export const getPlan = (planId: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getPlans,
        (p) => (p.get(planId) as Map<any, any>) || fromJS({})
    )

export const invoices = createSelector<RootState, List<any>, BillingState>(
    getBillingState,
    (billing) =>
        (billing.get('invoices', fromJS([])) as List<any>).filter(
            (invoice: Map<any, any>) =>
                !!invoice.get('attempted') && invoice.get('amount_due') > 0
        ) as List<any>
)

export const getContact = createSelector<
    RootState,
    Maybe<Map<any, any>>,
    BillingState
>(
    getBillingState,
    (billing) => (billing.get('contact') as Map<any, any>) || null
)

export const creditCard = createSelector<
    RootState,
    Map<any, any>,
    BillingState
>(
    getBillingState,
    (billing) => (billing.get('creditCard') as Map<any, any>) || fromJS({})
)

export const paymentMethod = createSelector<RootState, string, BillingState>(
    getBillingState,
    (billing) => (billing.get('paymentMethod') as string) || ''
)

export const currentUsage = createSelector<
    RootState,
    Map<any, any>,
    BillingState
>(
    getBillingState,
    (billing) => (billing.get('currentUsage') as Map<any, any>) || fromJS({})
)

export const planIntegrations = createSelector<
    RootState,
    number,
    Map<any, any>
>(getCurrentPlan, (plan) => plan.get('integrations', 0) as number)

export const isAllowedToCreateIntegration = createSelector<
    RootState,
    boolean,
    number,
    List<any>
>(
    planIntegrations,
    getActiveIntegrations,
    (integrations, activeIntegrations) => {
        return integrations > activeIntegrations.size
    }
)

export const isAllowedToChangePlan = (planId: string) =>
    createSelector<RootState, boolean, Map<any, any>, List<any>>(
        getPlan(planId),
        getActiveIntegrations,
        (plan, activeIntegrations) => {
            return plan.get('integrations', 0) >= activeIntegrations.size
        }
    )

export const makeIsAllowedToChangePlan = (state: RootState) => (
    planId: string
) => isAllowedToChangePlan(planId)(state)

export const hasLegacyPlan = createSelector<
    RootState,
    boolean,
    Map<any, any>,
    Map<any, any>
>(
    getCurrentPlan,
    getCurrentAccountState as (state: RootState) => CurrentAccountState,
    (plan, account) => {
        return (
            !!account.getIn(['meta', 'has_legacy_features']) ||
            (!plan.isEmpty() && !plan.get('public'))
        )
    }
)
