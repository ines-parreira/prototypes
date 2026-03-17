import type {
    MetricTrend,
    MetricTrendFormat,
    TrendDirection,
} from '../../types'
import type {
    ChartDataItem,
    MultipleTimeSeriesDataItem,
    TimeSeriesDataItem,
} from '../ChartCard'

export enum ConfigurableGraphType {
    Donut = 'donut',
    Bar = 'bar',
    TimeSeries = 'timeSeries',
    MultipleTimeSeries = 'multipleTimeSeries',
    HorizontalBar = 'horizontal-bar',
}

type DonutOrBarGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'bar' | 'donut'
    useChartData: () => { data: ChartDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    period?: { start_datetime: string; end_datetime: string }
}

type TimeSeriesGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'timeSeries'
    useChartData: () => { data: TimeSeriesDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
}

type MultipleTimeSeriesGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'multipleTimeSeries'
    useChartData: () => {
        data: MultipleTimeSeriesDataItem[]
        isLoading: boolean
    }
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
}

type HorizontalBarGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'horizontal-bar'
    useChartData: () => { data: ChartDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    initialItemsCount?: number
    showExpandButton?: boolean
    maxExpandedHeight?: number
}

export type ConfigurableGraphGroupingConfig =
    | DonutOrBarGroupingConfig
    | TimeSeriesGroupingConfig
    | MultipleTimeSeriesGroupingConfig
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
