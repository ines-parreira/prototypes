import {ReactNode} from 'react'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'

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
