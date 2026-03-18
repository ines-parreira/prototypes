import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import { createSelector } from 'reselect'

import type {
    AutomatePlan,
    AvailablePlansOf,
    ConvertPlan,
    HelpdeskPlan,
    Plan,
    PlanId,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { getCheapestPlan } from 'models/billing/utils'
import { getCurrentSubscription } from 'state/currentAccount/selectors'
import type {
    AccountFeature,
    AccountFeatureMetadata,
    CurrentAccountState,
} from 'state/currentAccount/types'

import type { RootState } from '../types'
import type {
    BillingImmutableState,
    CurrentProductsUsages,
    ReduxBillingState,
} from './types'

/**
 * @deprecated
 * @date 2021-02-01
 * @type feature-helper-fn
 */
export const DEPRECATED_getBillingState = (
    state: RootState,
): BillingImmutableState => state.billing || fromJS({})

export const getBillingState = createSelector(
    DEPRECATED_getBillingState,
    (billingState) => {
        return billingState.toJS() as ReduxBillingState
    },
)

export const getAvailablePlansByProduct = createSelector(
    getBillingState,
    (billingState) => {
        return billingState.products
    },
)

export const getAvailableHelpdeskPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const helpdeskProduct = products.find(
            (product): product is AvailablePlansOf<ProductType.Helpdesk> =>
                product.type === ProductType.Helpdesk,
        )
        if (!helpdeskProduct) {
            return []
        }
        return helpdeskProduct.prices.sort((a, b) => a.amount - b.amount)
    },
)

export const getAvailableAutomatePlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const autProduct = products.find(
            (product): product is AvailablePlansOf<ProductType.Automation> =>
                product.type === ProductType.Automation,
        )
        if (!autProduct) {
            return []
        }
        return autProduct.prices.sort((a, b) => a.amount - b.amount)
    },
)

export const getAvailableVoicePlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const voiceProduct = products.find(
            (product): product is AvailablePlansOf<ProductType.Voice> =>
                product.type === ProductType.Voice,
        )
        if (!voiceProduct) {
            return []
        }
        return voiceProduct.prices.sort((a, b) => a.amount - b.amount)
    },
)

export const getAvailableSmsPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const smsProduct = products.find(
            (product): product is AvailablePlansOf<ProductType.SMS> =>
                product.type === ProductType.SMS,
        )
        if (!smsProduct) {
            return []
        }
        return smsProduct.prices.sort((a, b) => a.amount - b.amount)
    },
)

export const getAvailableConvertPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const convertProduct = products.find(
            (product): product is AvailablePlansOf<ProductType.Convert> =>
                product.type === ProductType.Convert,
        )
        if (!convertProduct) {
            return []
        }
        return convertProduct.prices.sort((a, b) => a.amount - b.amount)
    },
)

export const getCurrentPlansByProduct = createSelector(
    getCurrentSubscription as (state: RootState) => CurrentAccountState,
    getAvailableHelpdeskPlans,
    getAvailableAutomatePlans,
    getAvailableVoicePlans,
    getAvailableSmsPlans,
    getAvailableConvertPlans,
    (
        currentSubscription,
        helpdeskAvailablePlans,
        automateAvailablePlans,
        voiceAvailablePlans,
        smsAvailablePlans,
        convertAvailablePlans,
    ) => {
        // For now, a helpdesk plan is required for the app to work.
        const currentPlansByProduct: {
            [ProductType.Helpdesk]: HelpdeskPlan
            [ProductType.Automation]?: AutomatePlan
            [ProductType.Voice]?: SMSOrVoicePlan
            [ProductType.SMS]?: SMSOrVoicePlan
            [ProductType.Convert]?: ConvertPlan
        } = {} as any

        // First, assume that subscription.products is billing-provider agnostic
        // i.e. <ProductType, PlanId>
        const currentPlansIdByProductType: Record<ProductType, PlanId> = (
            (currentSubscription.get('products') || fromJS({})) as Map<any, any>
        ).toJS()

        Object.values(currentPlansIdByProductType).forEach((planId) => {
            const helpdeskPlan = helpdeskAvailablePlans.find(
                (plan) => plan.plan_id === planId,
            )

            if (!!helpdeskPlan) {
                currentPlansByProduct[ProductType.Helpdesk] = helpdeskPlan
                return
            }

            const autPlan = automateAvailablePlans.find(
                (plan) => plan.plan_id === planId,
            )

            if (!!autPlan) {
                currentPlansByProduct[ProductType.Automation] = autPlan
                return
            }

            const voicePlan = voiceAvailablePlans.find(
                (plan) => plan.plan_id === planId,
            )

            if (!!voicePlan) {
                currentPlansByProduct[ProductType.Voice] = voicePlan
                return
            }

            const smsPlan = smsAvailablePlans.find(
                (plan) => plan.plan_id === planId,
            )

            if (!!smsPlan) {
                currentPlansByProduct[ProductType.SMS] = smsPlan
                return
            }

            const convertPlan = convertAvailablePlans.find(
                (plan) => plan.plan_id === planId,
            )

            if (!!convertPlan) {
                currentPlansByProduct[ProductType.Convert] = convertPlan
                return
            }
        })

        return !_isEmpty(currentPlansByProduct)
            ? currentPlansByProduct
            : undefined
    },
)

export const getCurrentHelpdeskPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.helpdesk,
)

export const getCurrentAutomatePlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.automation,
)

export const getCurrentVoicePlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.voice,
)

export const getCurrentSmsPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.sms,
)

export const getCurrentConvertPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.convert,
)

export const currentAccountHasProduct = (product: ProductType) =>
    createSelector(
        getCurrentPlansByProduct,
        (currentProducts) => !!currentProducts?.[product],
    )

export const getCurrentHelpdeskPlanName = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.name,
)

export const getCurrentHelpdeskCadence = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.cadence,
)

export const getIsCurrentHelpdeskLegacy = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => !!currentHelpdeskPlan?.is_legacy,
)

export const getIsCurrentHelpdeskCustom = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => !!currentHelpdeskPlan?.custom,
)

export const getCurrentHelpdeskMaxIntegrations = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.integrations || 0,
)

export const getCurrentProductsFeatures = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) =>
        Object.values(currentPlans || {}).reduce<
            Partial<Record<AccountFeature, AccountFeatureMetadata>>
        >(
            (acc, product) =>
                'features' in product
                    ? Object.assign(acc, product.features)
                    : acc,
            {},
        ),
)

export const makeHasFeature = createSelector(
    getCurrentProductsFeatures,
    (features) => (feature: AccountFeature) => !!features[feature]?.enabled,
)

export const getAvailablePlans = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products
            .reduce<
                Array<Plan>
            >((acc, product) => acc.concat(product.prices), [])
            .sort((a, b) => a.amount - b.amount),
)

export const getAvailablePlansMap = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products.reduce<Record<PlanId, Plan>>((acc, product) => {
            product.prices.map((plan) => {
                acc[plan.plan_id] = plan
            })
            return acc
        }, {}),
)

export const getAvailablePlansMapByPlanId = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products.reduce<Record<PlanId, Plan>>((acc, product) => {
            product.prices.map((plan) => {
                acc[plan.plan_id] = plan
            })
            return acc
        }, {}),
)

export const getAvailableAutomatePlansMap = createSelector(
    getAvailableAutomatePlans,
    (plans) =>
        plans.reduce<Record<PlanId, AutomatePlan>>((acc, plan) => {
            acc[plan.plan_id] = plan
            return acc
        }, {}),
)

export const getHasAutomate = createSelector(
    getCurrentAutomatePlan,
    (plan) => !!plan,
)

export const creditCard = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('creditCard') as Map<any, any>) || fromJS({}),
)

export const getCurrentUsage = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('currentUsage') as Map<any, any>) || fromJS({}),
)

export const getCurrentProductsUsage = createSelector(
    DEPRECATED_getBillingState,
    (billing) =>
        billing.get('currentProductsUsage')?.toJS() as
            | CurrentProductsUsages
            | undefined,
)

export const getCheapestSMSPlan = createSelector(
    getAvailableSmsPlans,
    getCurrentHelpdeskCadence,
    (smsPlans, cadence) => getCheapestPlan(smsPlans, cadence),
)

export const getCheapestVoicePlan = createSelector(
    getAvailableVoicePlans,
    getCurrentHelpdeskCadence,
    (voicePlans, cadence) => getCheapestPlan(voicePlans, cadence),
)

export const getCheapestConvertPlan = createSelector(
    getAvailableConvertPlans,
    getCurrentHelpdeskCadence,
    (convertPlans, cadence) => getCheapestPlan(convertPlans, cadence),
)

export const getCheapestProductPlans = createSelector(
    getAvailableHelpdeskPlans,
    getAvailableAutomatePlans,
    getAvailableVoicePlans,
    getAvailableSmsPlans,
    getAvailableConvertPlans,
    getCurrentHelpdeskCadence,
    (
        helpdeskPlans,
        automationPlans,
        voicePlans,
        smsPlans,
        convertPlans,
        cadence,
    ) => {
        return {
            helpdesk: getCheapestPlan(helpdeskPlans, cadence),
            automation: getCheapestPlan(automationPlans, cadence),
            voice: getCheapestPlan(voicePlans, cadence),
            sms: getCheapestPlan(smsPlans, cadence),
            convert: getCheapestPlan(convertPlans, cadence),
        }
    },
)

export const getIsVettedForPhone = createSelector(
    getCurrentVoicePlan,
    getCurrentSmsPlan,
    (voicePlan, smsPlan) => !!(voicePlan?.plan_id || smsPlan?.plan_id),
)

export const getVoiceOrSmsPlanChanged = ({
    selectedVoicePlan,
    selectedSmsPlan,
}: {
    selectedVoicePlan?: SMSOrVoicePlan
    selectedSmsPlan?: SMSOrVoicePlan
}) =>
    createSelector(
        getCurrentVoicePlan,
        getCurrentSmsPlan,
        (voicePlan, smsPlan) => {
            return (
                voicePlan?.plan_id !== selectedVoicePlan?.plan_id ||
                smsPlan?.plan_id !== selectedSmsPlan?.plan_id
            )
        },
    )
