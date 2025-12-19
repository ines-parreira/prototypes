export type { MetricTrendFormat, TrendDirection } from '../../types'

export type ChartDataItem = {
    name: string
    value: number | null
}

export type TimeSeriesDataItem = {
    date: string
    value: number | null
}

export type ChartType = 'donut' | 'bar'
