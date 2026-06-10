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
import type {
    SankeyChartData,
    SankeyLinkClickPayload,
} from '../SankeyChart/types'

export enum ConfigurableGraphType {
    Donut = 'donut',
    Bar = 'bar',
    TimeSeries = 'timeSeries',
    MultipleTimeSeries = 'multipleTimeSeries',
    HorizontalBar = 'horizontal-bar',
    Sankey = 'sankey',
}

type DonutOrBarGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'bar' | 'donut'
    useChartData: () => { data: ChartDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    period?: { start_datetime: string; end_datetime: string }
    showLegendValue?: boolean
}

type TimeSeriesGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'timeSeries'
    useChartData: () => { data: TimeSeriesDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
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

type SankeyGroupingConfig = {
    id: string
    name: string
    configurableGraphType: 'sankey'
    useChartData: () => { data: SankeyChartData; isLoading: boolean }
    valueFormatter?: (value: number) => string
    onLinkClick?: (payload: SankeyLinkClickPayload) => void
    hoverableNodeNames?: string[]
    nodeWidth?: number
    nodePadding?: number
    minNodeHeight?: number
    maxNodeHeight?: number
    minHeightToShowLabel?: number
    showPercentageWithValue?: boolean
    nodeAlign?: 'left' | 'justify'
    verticalAlign?: 'top' | 'justify'
}

export type ConfigurableGraphGroupingConfig =
    | DonutOrBarGroupingConfig
    | TimeSeriesGroupingConfig
    | MultipleTimeSeriesGroupingConfig
    | HorizontalBarGroupingConfig
    | SankeyGroupingConfig

export type ConfigurableGraphMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs?: TrendDirection
    tooltipData?: { period: string }
    useTrendData?: () => MetricTrend
    dimensions: ConfigurableGraphGroupingConfig[]
}
