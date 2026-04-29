import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    PlansByProduct,
    SMSOrVoicePlan,
} from '../types'
import { ProductType } from '../types'

export type CurrentPlansByProduct = {
    helpdesk?: HelpdeskPlan
    automation?: AutomatePlan
    voice?: SMSOrVoicePlan
    sms?: SMSOrVoicePlan
    convert?: ConvertPlan
}

export type AvailablePlansByProduct = {
    helpdesk: HelpdeskPlan[]
    automation: AutomatePlan[]
    voice: SMSOrVoicePlan[]
    sms: SMSOrVoicePlan[]
    convert: ConvertPlan[]
}

export function buildPlansByProduct(
    current: CurrentPlansByProduct,
    available: AvailablePlansByProduct,
): PlansByProduct {
    return {
        [ProductType.Helpdesk]: {
            current: current.helpdesk,
            available: available.helpdesk,
        },
        [ProductType.Automation]: {
            current: current.automation,
            available: available.automation,
        },
        [ProductType.Voice]: {
            current: current.voice,
            available: available.voice,
        },
        [ProductType.SMS]: {
            current: current.sms,
            available: available.sms,
        },
        [ProductType.Convert]: {
            current: current.convert,
            available: available.convert,
        },
    }
}
