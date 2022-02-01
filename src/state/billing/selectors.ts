import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'

import {
    getEquivalentAutomationPlanId,
    getEquivalentRegularPlanId,
} from '../../models/billing/utils'
import {Plan} from '../../models/billing/types'
import {CurrentAccountState} from '../currentAccount/types'
import {getCurrentAccountState} from '../currentAccount/selectors'
import {getActiveIntegrations} from '../integrations/selectors'
import {RootState} from '../types'

import {BillingState, BillingImmutableState} from './types'

export const DEFAULT_PLAN = 'standard-usd-1'

export const DEPRECATED_getBillingState = (
    state: RootState
): BillingImmutableState => state.billing || fromJS({})

export const getBillingState = (state: RootState): BillingState =>
    state.billing.toJS() as BillingState

export const currentPlanId = createSelector<
    RootState,
    string | undefined,
    CurrentAccountState,
    BillingState
>(
    getCurrentAccountState as (state: RootState) => CurrentAccountState,
    getBillingState,
    (currentAccountState, billingState) => {
        return (currentAccountState.getIn(['current_subscription', 'plan']) ||
            billingState.futureSubscriptionPlan) as string | undefined
    }
)

export const DEPRECATED_getPlans = createSelector<
    RootState,
    Map<any, any>,
    BillingImmutableState
>(DEPRECATED_getBillingState, (state) => {
    return (
        (state.get('plans', fromJS({})) as Map<any, any>).sortBy(
            (plan: Map<any, any>) => (plan.get('order') as number) || Infinity
        ) as Map<any, any>
    ).map((plan: Map<any, any>) => {
        const amount = (plan.get('amount') as number) || 0
        return plan
            .set('amount', amount / 100) // stripe amount are in cents
            .set('currencySign', '$') // we only have USD today, change this when we add more currencies
    }) as Map<any, any>
})

export const getPlans = createSelector<RootState, Plan[], BillingState>(
    getBillingState,
    (state) =>
        Object.values(state.plans)
            .map((plan) => ({
                ...plan,
                amount: (plan.amount || 0) / 100, // stripe amount are in cents
                currencySign: '$', // we only have USD today, change this when we add more currencies
            }))
            .sort(({order: orderA}, {order: orderB}) => orderA - orderB)
)

export const DEPRECATED_getCurrentPlan = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>,
    string | undefined
>(
    DEPRECATED_getPlans,
    currentPlanId,
    (p, id) => (p.get(id) || fromJS({})) as Map<any, any>
)

export const getCurrentPlan = createSelector<
    RootState,
    Plan | undefined,
    Plan[],
    string | undefined
>(getPlans, currentPlanId, (plans, id) => plans.find((plan) => plan.id === id))

export const getPlan = (planId: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        DEPRECATED_getPlans,
        (p) => (p.get(planId) || fromJS({})) as Map<any, any>
    )

export const getHasAutomationAddOn = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(DEPRECATED_getCurrentPlan, (plan) => !!plan.get('automation_addon_included'))

export const getEquivalentAutomationCurrentPlan = createSelector<
    RootState,
    Map<any, any> | undefined,
    Map<any, any>,
    string | undefined
>(
    DEPRECATED_getPlans,
    currentPlanId,
    (plans, id) =>
        (id != null &&
            (plans.get(getEquivalentAutomationPlanId(id)) as Map<any, any>)) ||
        undefined
)

export const getEquivalentRegularCurrentPlan = createSelector<
    RootState,
    Map<any, any> | undefined,
    Map<any, any>,
    string | undefined
>(
    DEPRECATED_getPlans,
    currentPlanId,
    (plans, id) =>
        (id != null &&
            (plans.get(getEquivalentRegularPlanId(id)) as Map<any, any>)) ||
        undefined
)

export const getAddOnAutomationAmountCurrentPlan = createSelector<
    RootState,
    number | undefined,
    Map<any, any>,
    Map<any, any>
>(DEPRECATED_getCurrentPlan, DEPRECATED_getPlans, (currentPlan, plans) => {
    const equivalentPlan: Map<any, any> = plans.get(
        currentPlan.get('automation_addon_equivalent_plan')
    )
    if (!equivalentPlan) {
        return undefined
    }

    return Math.abs(equivalentPlan.get('amount') - currentPlan.get('amount'))
})

export const invoices = createSelector<
    RootState,
    List<any>,
    BillingImmutableState
>(
    DEPRECATED_getBillingState,
    (billing) =>
        (billing.get('invoices', fromJS([])) as List<any>).filter(
            (invoice: Map<any, any>) =>
                !!invoice.get('attempted') && invoice.get('amount_due') > 0
        ) as List<any>
)

export const getContact = createSelector<
    RootState,
    Maybe<Map<any, any>>,
    BillingImmutableState
>(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('contact') as Map<any, any>) || null
)

export const isMissingContactInformation = createSelector<
    RootState,
    boolean,
    Maybe<Map<any, any>>
>(
    getContact,
    (contact) =>
        !contact ||
        !contact.get('email') ||
        !contact.getIn(['shipping', 'address', 'country']) ||
        !contact.getIn(['shipping', 'address', 'postal_code']) ||
        (contact.getIn(['shipping', 'address', 'country']) === 'US' &&
            !contact.getIn(['shipping', 'address', 'state']))
)

export const creditCard = createSelector<
    RootState,
    Map<any, any>,
    BillingImmutableState
>(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('creditCard') as Map<any, any>) || fromJS({})
)

export const paymentMethod = createSelector<
    RootState,
    string,
    BillingImmutableState
>(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('paymentMethod') as string) || ''
)

export const getCurrentUsage = createSelector<
    RootState,
    Map<any, any>,
    BillingImmutableState
>(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('currentUsage') as Map<any, any>) || fromJS({})
)

export const planIntegrations = createSelector<
    RootState,
    number,
    Map<any, any>
>(DEPRECATED_getCurrentPlan, (plan) => plan.get('integrations', 0) as number)

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

export const makeIsAllowedToChangePlan =
    (state: RootState) => (planId: string) =>
        isAllowedToChangePlan(planId)(state)

export const hasLegacyPlan = createSelector<RootState, boolean, Map<any, any>>(
    DEPRECATED_getCurrentPlan,
    (plan) => !plan.isEmpty() && !plan.get('public')
)
