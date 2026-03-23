import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'

export type CancellationDates = Partial<Record<ProductType, string | null>>

export type PlansByProduct = {
    [ProductType.Helpdesk]: {
        current?: HelpdeskPlan
        available: HelpdeskPlan[]
    }
    [ProductType.Automation]: {
        current?: AutomatePlan
        available: AutomatePlan[]
    }
    [ProductType.Voice]: {
        current?: SMSOrVoicePlan
        available: SMSOrVoicePlan[]
    }
    [ProductType.SMS]: { current?: SMSOrVoicePlan; available: SMSOrVoicePlan[] }
    [ProductType.Convert]: { current?: ConvertPlan; available: ConvertPlan[] }
}

export type SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan?: HelpdeskPlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Automation]: {
        plan?: AutomatePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Voice]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.SMS]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Convert]: {
        plan?: ConvertPlan
        isSelected: boolean
        autoUpgrade?: boolean
    }
}

export type ProductSubscriptionDescriptions = {
    [key: string]: ProductSubscriptionDescription
}

export type ProductSubscriptionDescription = {
    detailsLink?: {
        label: string
        url: string
    }
    features?: string[]
}
