export type MetricTrendFormat =
    | 'decimal'
    | 'decimal-precision-1'
    | 'duration'
    | 'percent'
    | 'decimal-to-percent'
    | 'decimal-to-percent-precision-1'
    | 'currency'
    | 'currency-precision-1'
    | 'ratio'

export type MetricValueFormat =
    | 'decimal'
    | 'decimal-precision-1'
    | 'integer'
    | 'duration'
    | 'percent'
    | 'percent-refined'
    | 'decimal-to-percent'
    | 'decimal-to-percent-precision-1'
    | 'decimal-percent-to-integer-percent'
    | 'currency'
    | 'currency-precision-1'
    | 'percent-precision-1'
    | 'ratio'

export type TrendColor = 'neutral' | 'unchanged' | 'positive' | 'negative'
export type TrendDirection = 'more-is-better' | 'less-is-better' | 'neutral'

export type TooltipData = {
    title: string
    caption?: string
    link?: string
    linkText?: string
}

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

export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        label?: string
        value: number | null
        prevValue: number | null
    }
}
