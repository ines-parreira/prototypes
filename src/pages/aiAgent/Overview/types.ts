import { StatType } from 'models/stat/types'
import { MetricTrendFormat } from 'pages/stats/common/utils'

export type KpiMetric = {
    isLoading: boolean
    title: string
    hint: string
    value?: number | null
    prevValue?: number | null
    metricType: StatType.Number | StatType.Currency
    currency?: string
    metricFormat?: MetricTrendFormat
}
