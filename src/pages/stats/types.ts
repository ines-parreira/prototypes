import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'

export type AutomatedInteractionByFeatures = Exclude<
    AutomationBillingEventMeasure,
    | AutomationBillingEventMeasure.FirstResponseTimeWithAutomation
    | AutomationBillingEventMeasure.ResolutionTimeWithAutomation
    | AutomationBillingEventMeasure.OverallTimeSaved
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
    title: string
    link?: string
    className?: string
}
