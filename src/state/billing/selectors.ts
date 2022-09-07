import {createSelector} from 'reselect'
import {fromJS, List, Map} from 'immutable'

import {
    createAutomationPlanFromProducts,
    createHelpdeskPlanFromProducts,
    getFullPrice,
} from 'models/billing/utils'
import {
    AutomationPrice,
    HelpdeskPrice,
    Plan,
    Product,
    ProductType,
} from 'models/billing/types'
import {CurrentAccountState} from '../currentAccount/types'
import {getCurrentSubscription} from '../currentAccount/selectors'
import {getActiveIntegrations} from '../integrations/selectors'
import {RootState} from '../types'

import {
    BillingImmutableState,
    BillingState,
    PlanWithCurrencySign,
} from './types'

export const DEFAULT_PLAN = 'standard-usd-1'

export const DEPRECATED_getBillingState = (
    state: RootState
): BillingImmutableState => state.billing || fromJS({})

export const getBillingState = (state: RootState): BillingState => {
    return state.billing.toJS() as BillingState
}

const getProducts = createSelector(getBillingState, (billingState) => {
    return billingState.products
})

const getHelpdeskProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<HelpdeskPrice> =>
            product.type === ProductType.Helpdesk
    )!
})

const getAutomationProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<AutomationPrice> =>
            product.type === ProductType.Automation
    )!
})

const getCurrentProducts = createSelector(
    getCurrentSubscription as (state: RootState) => CurrentAccountState,
    getHelpdeskProduct,
    getAutomationProduct,
    (currentSubscription, helpdeskProduct, automationProduct) => {
        const currentSubscriptionProducts: Record<string, string> = (
            currentSubscription.get('products') as Map<any, any>
        ).toJS()

        const currentProducts: {
            [ProductType.Helpdesk]: HelpdeskPrice
            [ProductType.Automation]?: AutomationPrice
        } = {} as any
        Object.entries(currentSubscriptionProducts).forEach(
            ([productId, priceId]) => {
                if (helpdeskProduct.id === productId) {
                    currentProducts[ProductType.Helpdesk] =
                        helpdeskProduct.prices.find(
                            (price) => price.price_id === priceId
                        )!
                }

                if (automationProduct.id === productId) {
                    currentProducts[ProductType.Automation] =
                        automationProduct.prices.find(
                            (price) => price.price_id === priceId
                        )!
                }
            }
        )
        return currentProducts
    }
)

const getCurrentHelpdeskProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => {
        return currentProducts.helpdesk
    }
)

const getCurrentAutomationProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => {
        return currentProducts.automation
    }
)

export const currentPlanId = createSelector(
    getCurrentHelpdeskProduct,
    getCurrentAutomationProduct,
    getBillingState,
    (helpdeskProduct, automationProduct, billingState) => {
        return (
            automationProduct?.legacy_id ||
            helpdeskProduct?.legacy_id ||
            billingState.futureSubscriptionPlan
        )
    }
)

export const getPlans = createSelector(getProducts, (products) => {
    const helpdeskProductPrices = products.find(
        (product): product is Product<HelpdeskPrice> =>
            product.type === ProductType.Helpdesk
    )!.prices
    const automationProductPrices = products.find(
        (product): product is Product<AutomationPrice> =>
            product.type === ProductType.Automation
    )!.prices

    const basePlans: PlanWithCurrencySign[] = helpdeskProductPrices.map(
        (product) => {
            const equivalentAutomationPriceId = product.addons
                ? product.addons[0]
                : undefined
            const equivalentAutomationProduct = equivalentAutomationPriceId
                ? automationProductPrices.find(
                      (price) => price.price_id === equivalentAutomationPriceId
                  )
                : undefined
            return createHelpdeskPlanFromProducts(
                product,
                equivalentAutomationProduct
            )
        }
    )
    const automationPlans = automationProductPrices.map((product) => {
        const equivalentHelpdeskProduct = helpdeskProductPrices.find(
            (price) => price.price_id === product.base_price_id
        )!

        return createAutomationPlanFromProducts(
            product,
            equivalentHelpdeskProduct
        )
    })
    return [...basePlans, ...automationPlans].sort(
        ({order: orderA}, {order: orderB}) =>
            (orderA || Infinity) - (orderB || Infinity)
    )
})

export const DEPRECATED_getPlans = createSelector<
    RootState,
    Map<any, any>,
    PlanWithCurrencySign[]
>(getPlans, (plans) => {
    const planDictionary: Record<string, PlanWithCurrencySign> = {}
    plans.forEach((plan) => {
        planDictionary[plan.id] = plan
    })
    return (fromJS(planDictionary) as Map<any, any>).sortBy(
        (plan: Map<any, any>) => (plan.get('order') as number) || Infinity
    ) as Map<any, any>
})

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
>(getPlans, currentPlanId, (plans, id) => {
    return plans.find((plan) => plan.id === id)
})

export const DEPRECATED_getPlan = (planId: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        DEPRECATED_getPlans,
        (p) => (p.get(planId) || fromJS({})) as Map<any, any>
    )

export const getPlan = (planId: string) =>
    createSelector(getPlans, (plans) =>
        plans.find((plan) => plan.id === planId)
    )

export const getHasAutomationAddOn = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(DEPRECATED_getCurrentPlan, (plan) => !!plan.get('automation_addon_included'))

export const getEquivalentAutomationCurrentPlan = createSelector<
    RootState,
    Plan | undefined,
    Plan[],
    Plan | undefined
>(getPlans, getCurrentPlan, (plans, currentPlan) => {
    return currentPlan
        ? !currentPlan.automation_addon_included
            ? plans.find(
                  (plan) =>
                      plan.id ===
                      currentPlan['automation_addon_equivalent_plan']
              )
            : currentPlan
        : undefined
})

export const getEquivalentRegularCurrentPlan = createSelector<
    RootState,
    Map<any, any> | undefined,
    Map<any, any>,
    Plan | undefined
>(DEPRECATED_getPlans, getCurrentPlan, (plans, currentPlan) =>
    currentPlan
        ? currentPlan.automation_addon_included
            ? (plans.get(
                  currentPlan['automation_addon_equivalent_plan']
              ) as Map<any, any>)
            : (fromJS(currentPlan) as Map<any, any>)
        : undefined
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

export const getAddOnAutomationDiscountCurrentPlan = createSelector<
    RootState,
    number | undefined,
    Plan[],
    Plan | undefined
>(getPlans, getCurrentPlan, (plans, currentPlan) => {
    if (currentPlan?.automation_addon_included) {
        return currentPlan.automation_addon_discount
    }

    const equivalentPlan =
        currentPlan &&
        plans.find(
            (plan) => plan.id === currentPlan.automation_addon_equivalent_plan
        )
    if (!equivalentPlan) {
        return undefined
    }

    return equivalentPlan.automation_addon_discount
})

export const getAddOnAutomationFullAmountCurrentPlan = createSelector<
    RootState,
    number | undefined,
    number | undefined,
    number | undefined
>(
    getAddOnAutomationAmountCurrentPlan,
    getAddOnAutomationDiscountCurrentPlan,
    (amount, discount) => {
        if (amount && discount) {
            return getFullPrice(amount, discount)
        }

        return undefined
    }
)

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
        DEPRECATED_getPlan(planId),
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
    (plan) => !plan.isEmpty() && (plan.get('is_legacy') as boolean)
)
