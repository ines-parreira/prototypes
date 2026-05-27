import type { CSSProperties, ReactNode, SVGProps } from 'react'

import type { SizeValue } from '@gorgias/axiom'

export type AxisDomainValue = number | string
export type ResponsiveContainerWidth = number | `${number}%`
export type AxisTickValue = string | number
export type AxisTickPayload = {
    value: AxisTickValue
}

export type HorizontalGridLineProps = {
    offset?: { top: number; height: number }
    stroke?: string
    strokeDasharray?: string | number | number[]
    strokeLinecap?: SVGProps<SVGLineElement>['strokeLinecap']
    strokeWidth?: SVGProps<SVGLineElement>['strokeWidth']
    x1?: number
    x2?: number
    y1?: number
    y2?: number
}

export type LegendGlyphVariant = 'line' | 'checkbox'

export type ComposedMetricTimeSeriesDataItem = Record<
    string,
    string | number | null | undefined
>

export type ComposedMetricTimeSeriesMarker = {
    id: string
    date: string
    label: string
    description?: string
    actionHref?: string
    actionLabel?: string
}

export type ComposedMetricTimeSeriesMetricConfig = {
    dataKey: string
    label: string
    color?: string
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    yAxisDomain?: [AxisDomainValue, AxisDomainValue]
}

export type ComposedMetricTimeSeriesTooltipMetric = {
    label: string
    color: string
    value: number | null
    formattedValue: string
}

export type ComposedMetricTimeSeriesTooltipProps = {
    date: string
    barMetric: ComposedMetricTimeSeriesTooltipMetric
    lineMetric: ComposedMetricTimeSeriesTooltipMetric
    markerColor: string
    markers: ComposedMetricTimeSeriesMarker[]
}

export type ComposedMetricTimeSeriesMarkerPoint =
    ComposedMetricTimeSeriesMarker & {
        value: number
    }

export type ComposedMetricTimeSeriesChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: ComposedMetricTimeSeriesDataItem[]
    barMetric: ComposedMetricTimeSeriesMetricConfig
    lineMetric: ComposedMetricTimeSeriesMetricConfig
    dateKey?: string
    dateFormatter?: (date: string) => string
    isLoading?: boolean
    chartHeight?: number
    legendGap?: CSSProperties['marginTop']
    maxBarSize?: number
    markerColor?: string
    markerLegendLabel?: string
    markers?: ComposedMetricTimeSeriesMarker[]
    renderTooltip?: (props: ComposedMetricTimeSeriesTooltipProps) => ReactNode
    withLegend?: boolean
}

export type TooltipRendererOptions = Pick<
    ComposedMetricTimeSeriesChartProps,
    | 'barMetric'
    | 'lineMetric'
    | 'dateKey'
    | 'dateFormatter'
    | 'markerColor'
    | 'markers'
    | 'renderTooltip'
> & {
    barColor?: string
    lineColor?: string
}

export type XAxisTickProps = {
    x?: number
    y?: number
    payload?: AxisTickPayload
    dateFormatter?: (date: string) => string
}

export type TooltipMetricRowProps = {
    metric: ComposedMetricTimeSeriesTooltipMetric
}

export type TooltipMarkerProps = {
    marker: ComposedMetricTimeSeriesMarker
    markerColor: string
}

export type LegendGlyphProps = {
    color: string
    variant: LegendGlyphVariant
}

export type ResolvedComposedMetricTimeSeriesMetricConfig =
    ComposedMetricTimeSeriesMetricConfig & {
        color: string
    }

export type ChartLegendProps = {
    barMetric: ResolvedComposedMetricTimeSeriesMetricConfig
    lineMetric: ResolvedComposedMetricTimeSeriesMetricConfig
    markerColor: string
    markerLegendLabel?: string
    style?: CSSProperties
}
