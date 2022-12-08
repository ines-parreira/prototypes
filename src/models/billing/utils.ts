import {ColorType} from 'pages/common/components/Badge/Badge'
import {AutomationPrice, HelpdeskPrice} from 'models/billing/types'

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
    price: HelpdeskPrice | AutomationPrice
): price is HelpdeskPrice {
    return 'public' in price
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}
