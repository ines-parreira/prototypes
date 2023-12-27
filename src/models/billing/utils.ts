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

export function isHelpdeskPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
): price is HelpdeskPrice {
    return 'public' in price
}

export function isAutomationPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
): price is AutomationPrice {
    return 'automation_addon_discount' in price
}

export function isStarterTierPrice(
    price: HelpdeskPrice | undefined
): price is HelpdeskPrice {
    return !!price?.internal_id.startsWith('starter-')
}

export function isTrialPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice,
    type: ProductType
) {
    return (
        price.num_quota_tickets === 0 &&
        (type === ProductType.Voice ||
            type === ProductType.SMS ||
            type === ProductType.Convert)
    )
}

export function isAAOLegacyPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice,
    type: ProductType
) {
    return price.num_quota_tickets === null && type === ProductType.Automation
}

export function isEnterprisePrice(price: ConvertPrice, type: ProductType) {
    return type === ProductType.Convert && price?.custom
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

export function getProductLabel(
    price: Price,
    type: ProductType
): string | undefined {
    if (isTrialPrice(price, type)) {
        if (type === ProductType.Convert) {
            return 'Pay as you go'
        }

        return 'Trial'
    }

    if (isAAOLegacyPrice(price, type)) {
        return 'Legacy'
    }
}
