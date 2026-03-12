import type {
    MetricTrend,
    MetricTrendFormat,
    TrendDirection,
} from '../../types'
import type { ChartDataItem, TimeSeriesDataItem } from '../ChartCard'

export enum ConfigurableGraphType {
    Donut = 'donut',
    Bar = 'bar',
    Line = 'line',
    HorizontalBar = 'horizontal-bar',
}

type DonutOrBarGroupingConfig = {
    id: string
    name: string
    chartType: 'bar' | 'donut'
    useChartData: () => { data: ChartDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    period?: { start_datetime: string; end_datetime: string }
}

type LineGroupingConfig = {
    id: string
    name: string
    chartType: 'line'
    useChartData: () => { data: TimeSeriesDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
}

type HorizontalBarGroupingConfig = {
    id: string
    name: string
    chartType: 'horizontal-bar'
    useChartData: () => { data: ChartDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    initialItemsCount?: number
    showExpandButton?: boolean
    maxExpandedHeight?: number
}

export type ConfigurableGraphGroupingConfig =
    | DonutOrBarGroupingConfig
    | LineGroupingConfig
    | HorizontalBarGroupingConfig

export type ConfigurableGraphMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs?: TrendDirection
    tooltipData?: { period: string }
    useTrendData?: () => MetricTrend
    dimensions: ConfigurableGraphGroupingConfig[]
}
