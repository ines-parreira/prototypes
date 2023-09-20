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

export const getProducts = createSelector(getBillingState, (billingState) => {
    return billingState.products
})

export const getHelpdeskProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<HelpdeskPrice> =>
            product.type === ProductType.Helpdesk
    )!
})

export const getAutomationProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<AutomationPrice> =>
            product.type === ProductType.Automation
    )!
})

export const getVoiceProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<SMSOrVoicePrice> =>
            product.type === ProductType.Voice
    )
})

export const getSMSProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<SMSOrVoicePrice> =>
            product.type === ProductType.SMS
    )
})

export const getConvertProduct = createSelector(getProducts, (products) => {
    return products.find(
        (product): product is Product<ConvertPrice> =>
            product.type === ProductType.Convert
    )
})

export const getCurrentProducts = createSelector(
    getCurrentSubscription as (state: RootState) => CurrentAccountState,
    getHelpdeskProduct,
    getAutomationProduct,
    getVoiceProduct,
    getSMSProduct,
    getConvertProduct,
    (
        currentSubscription,
        helpdeskProduct,
        automationProduct,
        voiceProduct,
        smsProduct,
        convertProduct
    ) => {
        const currentSubscriptionProducts: Record<string, string> = (
            (currentSubscription.get('products') || fromJS({})) as Map<any, any>
        ).toJS()

        const currentProducts: {
            [ProductType.Helpdesk]: HelpdeskPrice
            [ProductType.Automation]?: AutomationPrice
            [ProductType.Voice]?: SMSOrVoicePrice
            [ProductType.SMS]?: SMSOrVoicePrice
            [ProductType.Convert]?: ConvertPrice
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

                if (voiceProduct?.id === productId) {
                    currentProducts[ProductType.Voice] =
                        voiceProduct.prices.find(
                            (price) => price.price_id === priceId
                        )!
                }

                if (smsProduct?.id === productId) {
                    currentProducts[ProductType.SMS] = smsProduct.prices.find(
                        (price) => price.price_id === priceId
                    )!
                }

                if (convertProduct?.id === productId) {
                    const convertPrice = convertProduct.prices.find(
                        (price) => price.price_id === priceId
                    )!

                    if (!!convertPrice) {
                        currentProducts[ProductType.Convert] = convertPrice
                    }
                }
            }
        )
        return !_isEmpty(currentProducts) ? currentProducts : undefined
    }
)

export const getCurrentHelpdeskProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => currentProducts?.helpdesk
)

export const getCurrentAutomationProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => currentProducts?.automation
)

export const getCurrentVoiceProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => currentProducts?.voice
)

export const getCurrentSMSProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => currentProducts?.sms
)

export const getCurrentConvertProduct = createSelector(
    getCurrentProducts,
    (currentProducts) => currentProducts?.convert
)

export const getCurrentHelpdeskName = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => currentHelpdeskProduct?.name
)

export const getCurrentProductsAmount = createSelector(
    getCurrentProducts,
    (currentProducts) =>
        Object.values(currentProducts || {}).reduce(
            (acc, product) => acc + getFormattedAmount(product.amount),
            0
        )
)

export const getCurrentHelpdeskAddons = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => currentHelpdeskProduct?.addons
)

export const getCurrentHelpdeskAmount = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) =>
        currentHelpdeskProduct
            ? getFormattedAmount(currentHelpdeskProduct.amount)
            : undefined
)

export const getCurrentHelpdeskCurrency = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => currentHelpdeskProduct?.currency || 'usd'
)

export const getCurrentHelpdeskFreeTickets = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => currentHelpdeskProduct?.num_quota_tickets || 0
)

export const getCurrentHelpdeskInterval = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => currentHelpdeskProduct?.interval
)

export const getIsCurrentHelpdeskLegacy = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => !!currentHelpdeskProduct?.is_legacy
)

export const getIsCurrentHelpdeskCustom = createSelector(
    getCurrentHelpdeskProduct,
    (currentHelpdeskProduct) => !!currentHelpdeskProduct?.custom
)

export const getCurrentHelpdeskMaxIntegrations = createSelector(
    getCurrentHelpdeskProduct,
    (helpdeskProduct) => helpdeskProduct?.integrations || 0
)

export const getCurrentProductsFeatures = createSelector(
    getCurrentProducts,
    (currentProducts) =>
        Object.values(currentProducts || {}).reduce<
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

export const getPrices = createSelector(getProducts, (products) =>
    products
        .reduce<
            Array<
                HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
            >
        >((acc, product) => acc.concat(product.prices), [])
        .sort((a, b) => a.amount - b.amount)
)

export const getHelpdeskPrices = createSelector(getHelpdeskProduct, (product) =>
    product.prices.sort((a, b) => a.amount - b.amount)
)

export const getAutomationPrices = createSelector(
    getAutomationProduct,
    (product) => product.prices.sort((a, b) => a.amount - b.amount)
)

export const getPricesMap = createSelector(getProducts, (products) =>
    products.reduce<
        Record<
            string,
            HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
        >
    >((acc, product) => {
        product.prices.map((price) => {
            acc[price.price_id] = price
        })
        return acc
    }, {})
)

export const getAutomationPricesMap = createSelector(
    getAutomationProduct,
    (product) =>
        product.prices.reduce<Record<string, AutomationPrice>>((acc, price) => {
            acc[price.price_id] = price
            return acc
        }, {})
)

export const getHasAutomationAddOn = createSelector(
    getCurrentAutomationProduct,
    (price) => !!price
)

export const getHasLegacyAutomationAddOnFeatures = createSelector(
    getCurrentAccountState,
    getCurrentHelpdeskProduct,
    (accountState, product) => {
        const automationAddonLaunchDate = '2021-10-04T00:00:00Z'
        const accountCreatedBeforeAutomationAddonLaunch = moment
            .utc(accountState.get('created_datetime'))
            .isBefore(moment.utc(automationAddonLaunchDate))

        const hasLegacyAutomationAddonFeatures =
            !!product?.legacy_automation_addon_features

        return (
            accountCreatedBeforeAutomationAddonLaunch &&
            hasLegacyAutomationAddonFeatures
        )
    }
)

export const getCurrentHelpdeskAutomationAddonAmount = createSelector(
    getPricesMap,
    getCurrentHelpdeskProduct,
    getCurrentAutomationProduct,
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
    getCurrentAutomationProduct,
    (price) =>
        price?.amount && price?.automation_addon_discount
            ? getFormattedAmount(
                  getFullPrice(price.amount, price.automation_addon_discount)
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
    getPricesMap,
    getActiveIntegrations,
    (prices, activeIntegrations) => {
        return (priceId: string) => {
            const price = prices[priceId]

            return (
                (isHelpdeskPrice(price) ? price.integrations : 0) >=
                activeIntegrations.size
            )
        }
    }
)

export const getCheapestSMSPrice = createSelector(
    getSMSProduct,
    getCurrentHelpdeskInterval,
    (SMSProduct, interval) => getCheapestPrice(SMSProduct?.prices, interval)
)

export const getCheapestVoicePrice = createSelector(
    getVoiceProduct,
    getCurrentHelpdeskInterval,
    (voiceProduct, interval) => getCheapestPrice(voiceProduct?.prices, interval)
)

export const getCheapestProductPrices = createSelector(
    getHelpdeskPrices,
    getAutomationPrices,
    getVoiceProduct,
    getSMSProduct,
    getConvertProduct,
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
