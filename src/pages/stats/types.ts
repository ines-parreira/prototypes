import {ReactNode} from 'react'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'

export type AutomatedInteractionByFeatures = Exclude<
    AutomationBillingEventMeasure,
    | AutomationBillingEventMeasure.FirstResponseTimeWithAutomateFeatures
    | AutomationBillingEventMeasure.ResolutionTimeWithAutomateFeatures
    | AutomationBillingEventMeasure.DecreaseInResolutionTimeWithAutomateFeatures
    | AutomationBillingEventMeasure.AutomationRate
    | AutomationBillingEventMeasure.AutomatedInteractions
>

export type OneDimensionalDataItem = {
    label: string
    value: number
}

export type TwoDimensionalDataItem = {
    label: string
    tooltip?: string
    values: {
        x: string
        y: number
    }[]
}

export type TooltipData = {
    title: ReactNode
    link?: string
    className?: string
}

export type DropdownOption = {
    label: string
    value: string
}

export type FilterOptionGroup = {
    title?: string
    options: DropdownOption[]
}
