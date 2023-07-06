import _minBy from 'lodash/minBy'

import {ColorType} from 'pages/common/components/Badge/Badge'
import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
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
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
): price is HelpdeskPrice {
    return 'public' in price
}

export function isAutomationPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
): price is AutomationPrice {
    return 'automation_addon_discount' in price
}

export function isStarterTierPrice(
    price: HelpdeskPrice | undefined
): price is HelpdeskPrice {
    return !!price?.internal_id.startsWith('starter-')
}

export function isTrialVoiceOrSMSPrice(
    price: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice,
    type: ProductType
) {
    return (
        price.num_quota_tickets === 0 &&
        (type === ProductType.Voice || type === ProductType.SMS)
    )
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}

export const getCheapestPrice = (
    prices?: (HelpdeskPrice | AutomationPrice | SMSOrVoicePrice)[],
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
