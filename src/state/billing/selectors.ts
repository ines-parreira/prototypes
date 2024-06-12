import {createSelector} from 'reselect'
import {fromJS, List, Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import moment from 'moment-timezone'

import {
    getCheapestPrice,
    getFormattedAmount,
    getFullPrice,
    isHelpdeskPrice,
} from 'models/billing/utils'
import {
    AutomationPrice,
    ConvertPrice,
    HelpdeskPrice,
    Price,
    Product,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import {
    AccountFeature,
    AccountFeatureMetadata,
    CurrentAccountState,
} from 'state/currentAccount/types'
import {
    getCurrentAccountState,
    getCurrentSubscription,
} from 'state/currentAccount/selectors'
import {getActiveIntegrations} from 'state/integrations/selectors'
import {RootState} from '../types'

import {
    BillingImmutableState,
    BillingState,
    CurrentProductsUsages,
} from './types'

export const DEPRECATED_getBillingState = (
    state: RootState
): BillingImmutableState => state.billing || fromJS({})

export const getBillingState = createSelector(
    DEPRECATED_getBillingState,
    (billingState) => {
        return billingState.toJS() as BillingState
    }
)

export const getAvailablePlansByProduct = createSelector(
    getBillingState,
    (billingState) => {
        return billingState.products
    }
)

export const getAvailableHelpdeskPlansInProduct = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        return products.find(
            (product): product is Product<HelpdeskPrice> =>
                product.type === ProductType.Helpdesk
        )!
    }
)

export const getAvailableAutomatePlansInProduct = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        return products.find(
            (product): product is Product<AutomationPrice> =>
                product.type === ProductType.Automation
        )!
    }
)

export const getAvailableVoicePlansInProduct = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        return products.find(
            (product): product is Product<SMSOrVoicePrice> =>
                product.type === ProductType.Voice
        )
    }
)

export const getAvailableSmsPlansInProduct = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        return products.find(
            (product): product is Product<SMSOrVoicePrice> =>
                product.type === ProductType.SMS
        )
    }
)

export const getAvailableConvertPlansInProduct = createSelector(
    getAvailablePlansByProduct,
    (products) => {
        return products.find(
            (product): product is Product<ConvertPrice> =>
                product.type === ProductType.Convert
        )
    }
)

export const getCurrentPlansByProduct = createSelector(
    getCurrentSubscription as (state: RootState) => CurrentAccountState,
    getAvailableHelpdeskPlansInProduct,
    getAvailableAutomatePlansInProduct,
    getAvailableVoicePlansInProduct,
    getAvailableSmsPlansInProduct,
    getAvailableConvertPlansInProduct,
    (
        currentSubscription,
        helpdeskProduct,
        automateProduct,
        voiceProduct,
        smsProduct,
        convertProduct
    ) => {
        const currentSubscriptionProducts: Record<string, string> = (
            (currentSubscription.get('products') || fromJS({})) as Map<any, any>
        ).toJS()

        const currentPlansByProduct: {
            [ProductType.Helpdesk]: HelpdeskPrice
            [ProductType.Automation]?: AutomationPrice
            [ProductType.Voice]?: SMSOrVoicePrice
            [ProductType.SMS]?: SMSOrVoicePrice
            [ProductType.Convert]?: ConvertPrice
        } = {} as any
        Object.entries(currentSubscriptionProducts).forEach(
            ([productId, priceId]) => {
                if (helpdeskProduct.id === productId) {
                    const helpdeskPlan = helpdeskProduct.prices.find(
                        (plan) => plan.price_id === priceId
                    )

                    if (!!helpdeskPlan) {
                        currentPlansByProduct[ProductType.Helpdesk] =
                            helpdeskPlan
                    }
                }

                if (automateProduct.id === productId) {
                    const autPlan = automateProduct.prices.find(
                        (plan) => plan.price_id === priceId
                    )

                    if (!!autPlan) {
                        currentPlansByProduct[ProductType.Automation] = autPlan
                    }
                }

                if (voiceProduct?.id === productId) {
                    const voicePlan = voiceProduct.prices.find(
                        (plan) => plan.price_id === priceId
                    )

                    if (!!voicePlan) {
                        currentPlansByProduct[ProductType.Voice] = voicePlan
                    }
                }

                if (smsProduct?.id === productId) {
                    const smsPlan = smsProduct.prices.find(
                        (plan) => plan.price_id === priceId
                    )

                    if (!!smsPlan) {
                        currentPlansByProduct[ProductType.SMS] = smsPlan
                    }
                }

                if (convertProduct?.id === productId) {
                    const convertPlan = convertProduct.prices.find(
                        (plan) => plan.price_id === priceId
                    )

                    if (!!convertPlan) {
                        currentPlansByProduct[ProductType.Convert] = convertPlan
                    }
                }
            }
        )
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

export const getCurrentHelpdeskAddons = createSelector(
    getCurrentHelpdeskPlan,
    (currentHelpdeskPlan) => currentHelpdeskPlan?.addons
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
            .reduce<Array<Price>>(
                (acc, product) => acc.concat(product.prices),
                []
            )
            .sort((a, b) => a.amount - b.amount)
)

export const getAvailableHelpdeskPlans = createSelector(
    getAvailableHelpdeskPlansInProduct,
    (product) => product.prices.sort((a, b) => a.amount - b.amount)
)

export const getAvailableAutomatePlans = createSelector(
    getAvailableAutomatePlansInProduct,
    (product) => product.prices.sort((a, b) => a.amount - b.amount)
)

export const getAvailablePlansMap = createSelector(
    getAvailablePlansByProduct,
    (products) =>
        products.reduce<Record<string, Price>>((acc, product) => {
            product.prices.map((plan) => {
                acc[plan.price_id] = plan
            })
            return acc
        }, {})
)

export const getAvailableAutomatePlansMap = createSelector(
    getAvailableAutomatePlansInProduct,
    (product) =>
        product.prices.reduce<Record<string, AutomationPrice>>((acc, plan) => {
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

export const getCurrentHelpdeskAutomateAmount = createSelector(
    getAvailablePlansMap,
    getCurrentHelpdeskPlan,
    getCurrentAutomatePlan,
    (prices, helpdesk, automation) => {
        if (automation) {
            return getFormattedAmount(automation.amount)
        }
        const addonId = helpdesk?.addons?.[0]

        if (addonId && prices[addonId]) {
            return getFormattedAmount(prices[addonId].amount)
        }
        return undefined
    }
)

export const getCurrentAutomationFullAmount = createSelector(
    getCurrentAutomatePlan,
    (plan) =>
        plan?.amount && plan?.automation_addon_discount
            ? getFormattedAmount(
                  getFullPrice(plan.amount, plan.automation_addon_discount)
              )
            : undefined
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
                (isHelpdeskPrice(plan) ? plan.integrations : 0) >=
                activeIntegrations.size
            )
        }
    }
)

export const getCheapestSMSPrice = createSelector(
    getAvailableSmsPlansInProduct,
    getCurrentHelpdeskInterval,
    (SMSProduct, interval) => getCheapestPrice(SMSProduct?.prices, interval)
)

export const getCheapestVoicePrice = createSelector(
    getAvailableVoicePlansInProduct,
    getCurrentHelpdeskInterval,
    (voiceProduct, interval) => getCheapestPrice(voiceProduct?.prices, interval)
)

export const getCheapestConvertPrice = createSelector(
    getAvailableConvertPlansInProduct,
    getCurrentHelpdeskInterval,
    (convertProduct, interval) =>
        getCheapestPrice(convertProduct?.prices, interval)
)

export const getCheapestProductPrices = createSelector(
    getAvailableHelpdeskPlans,
    getAvailableAutomatePlans,
    getAvailableVoicePlansInProduct,
    getAvailableSmsPlansInProduct,
    getAvailableConvertPlansInProduct,
    getCurrentHelpdeskInterval,
    (
        helpDeskPrices,
        automationPrices,
        voiceProduct,
        smsProduct,
        convertProduct,
        interval
    ) => {
        return {
            helpdesk: getCheapestPrice(helpDeskPrices, interval),
            automation: getCheapestPrice(automationPrices, interval),
            voice: getCheapestPrice(voiceProduct?.prices, interval),
            sms: getCheapestPrice(smsProduct?.prices, interval),
            convert: getCheapestPrice(convertProduct?.prices, interval),
        }
    }
)
