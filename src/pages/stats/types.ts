export type OneDimensionalDataItem = {
    label: string
    value: number
}

export type TwoDimensionalDataItem = {
    label: string
    values: {
        x: string
        y: number
    }[]
}

export type TooltipData = {
    title: string
    link?: string
}
