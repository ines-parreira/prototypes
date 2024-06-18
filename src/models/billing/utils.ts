import _minBy from 'lodash/minBy'

import {ColorType} from 'pages/common/components/Badge/Badge'
import {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    PlanInterval,
    Plan,
    ProductType,
    SMSOrVoicePlan,
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

export function isHelpdesk(plan: Plan): plan is HelpdeskPlan {
    return plan.product === ProductType.Helpdesk
}

export function isAutomate(plan: Plan): plan is AutomatePlan {
    return plan.product === ProductType.Automation
}

export function isVoice(plan: Plan): plan is SMSOrVoicePlan {
    return plan.product === ProductType.Voice
}

export function isSms(plan: Plan): plan is SMSOrVoicePlan {
    return plan.product === ProductType.SMS
}

export function isConvert(plan: Plan): plan is ConvertPlan {
    return plan.product === ProductType.Convert
}

export function isStarterTierPrice(
    price: HelpdeskPlan | undefined
): price is HelpdeskPlan {
    return !!price?.internal_id.startsWith('starter-')
}

export function isTrial(plan: Plan | undefined) {
    if (!plan) return false

    return (
        plan.num_quota_tickets === 0 &&
        (isVoice(plan) || isSms(plan) || isConvert(plan))
    )
}

export function isLegacyAutomate(plan: Plan | undefined) {
    if (!plan) return false

    return (
        plan.num_quota_tickets === null &&
        plan.product === ProductType.Automation
    )
}

export function isEnterprise(plan: ConvertPlan | undefined) {
    if (!plan) return false

    return isConvert(plan) && plan?.custom
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}

export const getCheapestPrice = (plans?: Plan[], interval?: PlanInterval) =>
    !!plans
        ? _minBy(
              plans.filter(
                  (plan) => plan.interval === interval && plan.amount !== 0
              ),
              (plan) => plan.amount
          )
        : undefined

export function getProductLabel(plan: Plan): string | undefined {
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
