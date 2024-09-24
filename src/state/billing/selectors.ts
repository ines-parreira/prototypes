import {fromJS, List, Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import moment from 'moment-timezone'
import {createSelector} from 'reselect'

import {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    Plan,
    PriceId,
    Product,
    ProductId,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'
import {getCheapestPrice, isHelpdesk} from 'models/billing/utils'
import {
    getCurrentAccountState,
    getCurrentSubscription,
} from 'state/currentAccount/selectors'
import {
    AccountFeature,
    AccountFeatureMetadata,
    CurrentAccountState,
} from 'state/currentAccount/types'
import {getActiveIntegrations} from 'state/integrations/selectors'
import {RootState} from '../types'

import {
    BillingImmutableState,
    CurrentProductsUsages,
    ReduxBillingState,
} from './types'

export const DEPRECATED_getBillingState = (
    state: RootState
): BillingImmutableState => state.billing || fromJS({})

export const getBillingState = createSelector(
    DEPRECATED_getBillingState,
    (billingState) => {
        return billingState.toJS() as ReduxBillingState
    }
)

export const getAvailablePlansByProduct = createSelector(
    getBillingState,
    (billingState) => {
        return billingState.products
    }
)

export const getAvailableHelpdeskPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const helpdeskProduct = products.find(
            (product): product is Product<HelpdeskPlan> =>
                product.type === ProductType.Helpdesk
        )
        if (!helpdeskProduct) {
            return []
        }
        return helpdeskProduct.prices.sort((a, b) => a.amount - b.amount)
    }
)

export const getAvailableAutomatePlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const autProduct = products.find(
            (product): product is Product<AutomatePlan> =>
                product.type === ProductType.Automation
        )
        if (!autProduct) {
            return []
        }
        return autProduct.prices.sort((a, b) => a.amount - b.amount)
    }
)

export const getAvailableVoicePlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const voiceProduct = products.find(
            (product): product is Product<SMSOrVoicePlan> =>
                product.type === ProductType.Voice
        )
        if (!voiceProduct) {
            return []
        }
        return voiceProduct.prices.sort((a, b) => a.amount - b.amount)
    }
)

export const getAvailableSmsPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const smsProduct = products.find(
            (product): product is Product<SMSOrVoicePlan> =>
                product.type === ProductType.SMS
        )
        if (!smsProduct) {
            return []
        }
        return smsProduct.prices.sort((a, b) => a.amount - b.amount)
    }
)

export const getAvailableConvertPlans = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        const convertProduct = products.find(
            (product): product is Product<ConvertPlan> =>
                product.type === ProductType.Convert
        )
        if (!convertProduct) {
            return []
        }
        return convertProduct.prices.sort((a, b) => a.amount - b.amount)
    }
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
        convertAvailablePlans
    ) => {
        const currentPlansPriceIdByProduct: Record<ProductId, PriceId> = (
            (currentSubscription.get('products') || fromJS({})) as Map<any, any>
        ).toJS()

        // For now, a helpdesk plan is required for the app to work.
        const currentPlansByProduct: {
            [ProductType.Helpdesk]: HelpdeskPlan
            [ProductType.Automation]?: AutomatePlan
            [ProductType.Voice]?: SMSOrVoicePlan
            [ProductType.SMS]?: SMSOrVoicePlan
            [ProductType.Convert]?: ConvertPlan
        } = {} as any

        Object.values(currentPlansPriceIdByProduct).forEach((priceId) => {
            const helpdeskPlan = helpdeskAvailablePlans.find(
                (plan) => plan.price_id === priceId
            )

            if (!!helpdeskPlan) {
                currentPlansByProduct[ProductType.Helpdesk] = helpdeskPlan
                return
            }

            const autPlan = automateAvailablePlans.find(
                (plan) => plan.price_id === priceId
            )

            if (!!autPlan) {
                currentPlansByProduct[ProductType.Automation] = autPlan
                return
            }

            const voicePlan = voiceAvailablePlans.find(
                (plan) => plan.price_id === priceId
            )

            if (!!voicePlan) {
                currentPlansByProduct[ProductType.Voice] = voicePlan
                return
            }

            const smsPlan = smsAvailablePlans.find(
                (plan) => plan.price_id === priceId
            )

            if (!!smsPlan) {
                currentPlansByProduct[ProductType.SMS] = smsPlan
                return
            }

            const convertPlan = convertAvailablePlans.find(
                (plan) => plan.price_id === priceId
            )

            if (!!convertPlan) {
                currentPlansByProduct[ProductType.Convert] = convertPlan
                return
            }
        })
        return !_isEmpty(currentPlansByProduct)
            ? currentPlansByProduct
            : undefined
    }
)

export const getCurrentHelpdeskPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.helpdesk
)

export const getCurrentAutomatePlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.automation
)

export const getCurrentVoicePlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.voice
)

export const getCurrentSmsPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.sms
)

export const getCurrentConvertPlan = createSelector(
    getCurrentPlansByProduct,
    (currentPlans) => currentPlans?.convert
)

export const currentAccountHasProduct = (product: ProductType) =>
    createSelector(
        getCurrentPlansByProduct,
        (currentProducts) => !!currentProducts?.[product]
    )

export const getCurrentHelpdeskPlanName = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.name
)

export const getCurrentHelpdeskInterval = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.interval
)

export const getIsCurrentHelpdeskLegacy = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => !!currentHelpdeskPlan?.is_legacy
)

export const getIsCurrentHelpdeskCustom = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => !!currentHelpdeskPlan?.custom
)

export const getCurrentHelpdeskMaxIntegrations = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.integrations || 0
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
            {}
        )
)

export const makeHasFeature = createSelector(
    getCurrentProductsFeatures,
    (features) => (feature: AccountFeature) => !!features[feature]?.enabled
)

export const getAvailablePlans = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products
            .reduce<Array<Plan>>(
                (acc, product) => acc.concat(product.prices),
                []
            )
            .sort((a, b) => a.amount - b.amount)
)

export const getAvailablePlansMap = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products.reduce<Record<string, Plan>>((acc, product) => {
            product.prices.map((plan) => {
                acc[plan.price_id] = plan
            })
            return acc
        }, {})
)

export const getAvailableAutomatePlansMap = createSelector(
    getAvailableAutomatePlans,
    (plans) =>
        plans.reduce<Record<string, AutomatePlan>>((acc, plan) => {
            acc[plan.price_id] = plan
            return acc
        }, {})
)

export const getHasAutomate = createSelector(
    getCurrentAutomatePlan,
    (plan) => !!plan
)

export const getHasLegacyAutomateFeatures = createSelector(
    getCurrentAccountState,
    getCurrentHelpdeskPlan,
    (accountState, product) => {
        const automateLaunchDate = '2021-10-04T00:00:00Z'
        const accountCreatedBeforeAutomateLaunch = moment
            .utc(accountState.get('created_datetime'))
            .isBefore(moment.utc(automateLaunchDate))

        const hasLegacyAutomateFeatures =
            !!product?.legacy_automation_addon_features

        return accountCreatedBeforeAutomateLaunch && hasLegacyAutomateFeatures
    }
)

export const invoices = createSelector(
    DEPRECATED_getBillingState,
    (billing) =>
        (billing.get('invoices', fromJS([])) as List<any>).filter(
            (invoice: Map<any, any>) =>
                !!invoice.get('attempted') && invoice.get('amount_due') > 0
        ) as List<any>
)

export const getContact = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('contact') as Map<any, any> | null) || null
)

export const isMissingContactInformation = createSelector(
    getContact,
    (contact) =>
        !contact ||
        !contact.get('email') ||
        !contact.getIn(['shipping', 'address', 'country']) ||
        !contact.getIn(['shipping', 'address', 'postal_code']) ||
        (contact.getIn(['shipping', 'address', 'country']) === 'US' &&
            !contact.getIn(['shipping', 'address', 'state']))
)

export const creditCard = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('creditCard') as Map<any, any>) || fromJS({})
)

export const paymentMethod = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('paymentMethod') as string) || ''
)

export const getCurrentUsage = createSelector(
    DEPRECATED_getBillingState,
    (billing) => (billing.get('currentUsage') as Map<any, any>) || fromJS({})
)

export const getCurrentProductsUsage = createSelector(
    DEPRECATED_getBillingState,
    (billing) => billing.get('currentProductsUsage') as CurrentProductsUsages
)

export const makeGetIsAllowedToChangePrice = createSelector(
    getAvailablePlansMap,
    getActiveIntegrations,
    (prices, activeIntegrations) => {
        return (priceId: string) => {
            const plan = prices[priceId]

            return (
                (isHelpdesk(plan) ? plan.integrations : 0) >=
                activeIntegrations.size
            )
        }
    }
)

export const getCheapestSMSPrice = createSelector(
    getAvailableSmsPlans,
    getCurrentHelpdeskInterval,
    (smsPlans, interval) => getCheapestPrice(smsPlans, interval)
)

export const getCheapestVoicePrice = createSelector(
    getAvailableVoicePlans,
    getCurrentHelpdeskInterval,
    (voicePlans, interval) => getCheapestPrice(voicePlans, interval)
)

export const getCheapestConvertPrice = createSelector(
    getAvailableConvertPlans,
    getCurrentHelpdeskInterval,
    (convertPlans, interval) => getCheapestPrice(convertPlans, interval)
)

export const getCheapestProductPrices = createSelector(
    getAvailableHelpdeskPlans,
    getAvailableAutomatePlans,
    getAvailableVoicePlans,
    getAvailableSmsPlans,
    getAvailableConvertPlans,
    getCurrentHelpdeskInterval,
    (
        helpDeskPlans,
        automationPlans,
        voicePlans,
        smsPlans,
        convertPlans,
        interval
    ) => {
        return {
            helpdesk: getCheapestPrice(helpDeskPlans, interval),
            automation: getCheapestPrice(automationPlans, interval),
            voice: getCheapestPrice(voicePlans, interval),
            sms: getCheapestPrice(smsPlans, interval),
            convert: getCheapestPrice(convertPlans, interval),
        }
    }
)

export const getIsVettedForPhone = createSelector(
    getCurrentVoicePlan,
    getCurrentSmsPlan,
    (voicePlan, smsPlan) => !!(voicePlan?.price_id || smsPlan?.price_id)
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
                voicePlan?.price_id !== selectedVoicePlan?.price_id ||
                smsPlan?.price_id !== selectedSmsPlan?.price_id
            )
        }
    )
