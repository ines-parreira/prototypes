import _minBy from 'lodash/minBy'

import {ColorType} from 'pages/common/components/Badge/Badge'
import {
    AutomationPrice,
    ConvertPrice,
    HelpdeskPrice,
    PlanInterval,
    Price,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'

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

export function isHelpdeskPrice(plan: Price): plan is HelpdeskPrice {
    return plan.product === ProductType.Helpdesk
}

export function isAutomationPrice(price: Price): price is AutomationPrice {
    return 'automation_addon_discount' in price
}

export function isAutomate(plan: Price): plan is AutomationPrice {
    return plan.product === ProductType.Automation
}

export function isVoice(plan: Price): plan is SMSOrVoicePrice {
    return plan.product === ProductType.Voice
}

export function isSms(plan: Price): plan is SMSOrVoicePrice {
    return plan.product === ProductType.SMS
}

export function isConvert(plan: Price): plan is ConvertPrice {
    return plan.product === ProductType.Convert
}

export function isStarterTierPrice(
    price: HelpdeskPrice | undefined
): price is HelpdeskPrice {
    return !!price?.internal_id.startsWith('starter-')
}

export function isTrial(plan: Price | undefined) {
    if (!plan) return false

    return (
        plan.num_quota_tickets === 0 &&
        (isVoice(plan) || isSms(plan) || isConvert(plan))
    )
}

export function isLegacyAutomate(plan: Price | undefined) {
    if (!plan) return false

    return (
        plan.num_quota_tickets === null &&
        plan.product === ProductType.Automation
    )
}

export function isEnterprise(plan: ConvertPrice | undefined) {
    if (!plan) return false

    return isConvert(plan) && plan?.custom
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}

export const getCheapestPrice = (
    prices?: (
        | HelpdeskPrice
        | AutomationPrice
        | SMSOrVoicePrice
        | ConvertPrice
    )[],
    interval?: PlanInterval
) =>
    !!prices
        ? _minBy(
              prices.filter(
                  (price) => price.interval === interval && price.amount !== 0
              ),
              (price) => price.amount
          )
        : undefined

export function getProductLabel(plan: Price): string | undefined {
    if (isTrial(plan)) {
        if (isConvert(plan)) {
            return 'Pay as you go'
        }

        return 'Trial'
    }

    if (isLegacyAutomate(plan)) {
        return 'Legacy'
    }
}
