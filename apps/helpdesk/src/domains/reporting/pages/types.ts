import { ReactNode } from 'react'

import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'

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

/**
 * @deprecated Use TwoDimensionalDataItem from @repo/reporting instead
 * @date 2025-11-04
 * @type reporting-ui-kit
 */
export type TwoDimensionalDataItem = {
    label: string
    tooltip?: string
    values: {
        x: string
        y: number
    }[]
    isDashed?: boolean
    isDisabled?: boolean
}
/**
 * @deprecated Use TooltipData from @repo/reporting instead
 * @date 2025-09-15
 * @type reporting-ui-kit
 */
export type TooltipData = {
    title: string
    link?: string
    linkText?: string
    className?: string
}

export type DropdownOption = {
    label: string
    value: string
    icon?: ReactNode
}

export type FilterOptionGroup = {
    title?: string
    options: DropdownOption[]
}

export type MaybeData<T> = {
    data?: T
}

export type Prettify<T> = {
    [K in keyof T]: T[K]
    // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

export type OptionalProperty<T, K extends keyof T> = Prettify<
    Omit<T, K> & Partial<Pick<T, K>>
>

export type MetricConfig = {
    title: string
    hint: TooltipData
}
