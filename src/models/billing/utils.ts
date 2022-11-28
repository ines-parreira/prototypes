import _omit from 'lodash/omit'

import {ColorType} from 'pages/common/components/Badge/Badge'
import {
    AutomationPrice,
    HelpdeskPrice,
    Product,
    ProductType,
} from 'models/billing/types'
import {
    BillingProducts,
    PlanWithCurrencySign,
    ProductPriceSubscription,
} from 'state/billing/types'

export const PLAN_NAME_TO_BADGE_COLOR: Record<string, ColorType> = {
    Basic: ColorType.Classic,
    Pro: ColorType.Indigo,
    Advanced: ColorType.Success,
    Custom: ColorType.Warning,
    Enterprise: ColorType.Warning,
    Free: ColorType.Purple,
}

export const getFullPrice = (discounted_amount: number, discount: number) => {
    if (discount >= 0 && discount < 1) {
        return discounted_amount / (1 - discount)
    }

    throw new Error('discount amount must be a number between 0 and < 1')
}

export const createHelpdeskPlanFromProducts = (
    helpdeskPrice: HelpdeskPrice,
    automationPrice?: AutomationPrice
): PlanWithCurrencySign => {
    const plan: PlanWithCurrencySign = {
        id: helpdeskPrice.legacy_id,
        ..._omit(helpdeskPrice, [
            'legacy_id',
            'product_id',
            'addons',
            'price_id',
        ]),
        automation_addon_equivalent_plan: automationPrice?.legacy_id || null,
        automation_addon_discount: 0,
        amount: (helpdeskPrice.amount || 0) / 100, // stripe amount are in cents
        currencySign: '$', // we only have USD today, change this when we add more currencies
    }
    return plan
}

export const createAutomationPlanFromProducts = (
    automationPrice: AutomationPrice,
    helpdeskPrice: HelpdeskPrice
): PlanWithCurrencySign => {
    const plan: PlanWithCurrencySign = {
        ..._omit(helpdeskPrice, [
            'legacy_id',
            'product_id',
            'addons',
            'price_id',
        ]),
        ..._omit(automationPrice, [
            'legacy_id',
            'product_id',
            'base_price_id',
            'additional_cost_per_ticket',
            'price_id',
        ]),
        id: automationPrice.legacy_id,
        automation_addon_equivalent_plan: helpdeskPrice.legacy_id,
        features: {...helpdeskPrice.features, ...automationPrice.features},
        amount: (helpdeskPrice.amount + automationPrice.amount || 0) / 100, // stripe amount are in cents
        cost_per_ticket: +(
            helpdeskPrice.cost_per_ticket +
            automationPrice.additional_cost_per_ticket
        ).toFixed(2),
        currencySign: '$', // we only have USD today, change this when we add more currencies
    }
    return plan
}

export const getPricesByPlanId = (
    products: BillingProducts,
    planId: string
): ProductPriceSubscription => {
    let helpdeskPriceId: string | undefined = undefined
    let automationPriceId: string | undefined = undefined

    products
        .find((product) => product.type === ProductType.Helpdesk)!
        .prices.forEach((price) => {
            if (price.legacy_id === planId) {
                helpdeskPriceId = price.price_id
            }
        })

    products
        .find(
            (product): product is Product<AutomationPrice> =>
                product.type === ProductType.Automation
        )!
        .prices.forEach((price) => {
            if (price.legacy_id === planId) {
                automationPriceId = price.price_id
                helpdeskPriceId = price.base_price_id
            }
        })

    const prices: string[] = []
    !!helpdeskPriceId && prices.push(helpdeskPriceId)
    !!automationPriceId && prices.push(automationPriceId)

    return {
        prices,
    }
}

export function isHelpdeskPrice(
    price: HelpdeskPrice | AutomationPrice
): price is HelpdeskPrice {
    return 'public' in price
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}
