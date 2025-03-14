import _capitalize from 'lodash/capitalize'
import _minBy from 'lodash/minBy'

import { ColorType } from '@gorgias/merchant-ui-kit'

import {
    AutomateEarlyAccessPlan,
    AutomatePlan,
    Cadence,
    ConvertPlan,
    HelpdeskPlan,
    Plan,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { ENTERPRISE_PRICE_ID } from 'pages/settings/new_billing/constants'

import {
    formatAmount,
    formatNumTickets,
} from '../../pages/settings/new_billing/utils/formatAmount'

export const PLAN_NAME_TO_BADGE_COLOR: Record<string, ColorType> = {
    Basic: 'classic',
    Pro: 'indigo',
    Advanced: 'success',
    Custom: 'warning',
    Enterprise: 'warning',
    Free: 'purple',
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

export function isStarterTier(
    plan: HelpdeskPlan | undefined,
): plan is HelpdeskPlan {
    return !!plan?.plan_id.startsWith('starter-')
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

export function isEnterprise(plan: Plan | undefined) {
    if (!plan) return false

    return plan.custom || plan.price_id === ENTERPRISE_PRICE_ID
}

export function getFormattedAmount(amountInCents: number) {
    return amountInCents / 100
}

export const getCheapestPrice = (plans?: Plan[], cadence?: Cadence) =>
    !!plans
        ? _minBy(
              plans.filter(
                  (plan) => plan.cadence === cadence && plan.amount !== 0,
              ),
              (plan) => plan.amount,
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

const productNames: Record<ProductType, string> = {
    [ProductType.Automation]: 'Automate',
    [ProductType.Helpdesk]: 'Helpdesk',
    [ProductType.SMS]: 'SMS',
    [ProductType.Voice]: 'Voice',
    [ProductType.Convert]: 'Convert',
}

export function getProductName(product: ProductType): string {
    return productNames[product]
}

/**
 * @description
 *    Returns a string such as "$360/month"
 *
 * @param plan Plan
 * @returns string
 */
function getPlanPricePerCadence(plan: Plan): string {
    const planPrice = plan.amount / 100
    const planPricePerCadence: string = `${formatAmount(planPrice)}/${
        plan.cadence
    }`
    return planPricePerCadence
}

/**
 * @description
 *    Returns a string such as
 *    "2,000 tickets/month" for a Helpdesk plan
 *    "150 automated interactions/month" for an Automate plan
 *    "25 tickets/month" for a Voice or Sms plan
 *    "25 clicks/month" for a Convert plan
 *
 * @param plan Plan
 * @returns string
 */
export function getPlanUnitsPerCadence(plan: Plan): string {
    if (isLegacyAutomate(plan)) {
        return `${plan.extra_ticket_cost} extra for helpdesk tickets overages`
    }
    const amount = formatNumTickets(plan.num_quota_tickets ?? 0)

    switch (plan.product) {
        case ProductType.Automation:
            return `${amount} automated interactions/${plan.cadence}`
        case ProductType.Convert:
            return `${amount} clicks/${plan.cadence}`
        default:
            return `${amount} tickets/${plan.cadence}`
    }
}

/**
 * @description
 *    Returns a string such as
 *    "Pro, $360/month, 2,000 tickets/month" for a Helpdesk plan
 *    "$143/month, 150 automated interactions/month" for an Automate plan
 *    "$20/month, 25 tickets/month" for a Voice or Sms plan
 *    "$20/month, 25 clicks/month" for a Convert plan
 *
 * @param plan Plan
 * @returns string
 */
export function getPlanDescription(plan: Plan): string {
    const planName =
        plan.product === ProductType.Helpdesk ? `${plan.name}, ` : ''

    const amountPerCadence = getPlanPricePerCadence(plan)
    const unitsPerCadence = getPlanUnitsPerCadence(plan)

    return `${_capitalize(planName)}${amountPerCadence}, ${unitsPerCadence}`
}

export function getPlanPrice(plan: Plan | undefined | null): number {
    return (plan?.amount ?? 0) / 100
}

/**
 * @description
 *    Returns a string such as
 *    "$360" or "$360.10" when the number has decimals or
 *    "$36,000" when the number is with thousands
 *
 * @param plan Plan
 * @returns string
 */
export function getPlanPriceFormatted(plan: Plan | undefined | null): string {
    return formatAmount(getPlanPrice(plan), plan?.currency ?? 'usd')
}

/**
 * @description
 * Returns the amount after discount and the discount amount formatted for the automate early access plan
 * see getPlanPriceFormatted for more details about the format
 *
 * @param plan AutomateEarlyAccessPlan
 * @returns string
 */
export function getAutomateEarlyAccessPricesFormatted(
    plan: AutomateEarlyAccessPlan | undefined | null,
) {
    const amountAfterDiscountPrice = (plan?.amount_after_discount ?? 0) / 100
    const discountPrice = (plan?.discount ?? 0) / 100
    const currency = plan?.currency ?? 'usd'

    return {
        amountAfterDiscount: formatAmount(
            amountAfterDiscountPrice,
            plan?.currency ?? 'usd',
        ),
        discount:
            discountPrice > 0 ? formatAmount(discountPrice, currency) : null,
    }
}

export function getOverageUnitPriceFormatted(plan: Plan | undefined | null) {
    return formatAmount(plan?.extra_ticket_cost ?? 0)
}
