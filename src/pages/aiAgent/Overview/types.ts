import {StatType} from 'models/stat/types'

export type KpiMetric = {
    isLoading: boolean
    title: string
    hint: string
    value?: number | null
    prevValue?: number | null
    metricType: StatType.Number | StatType.Percent | StatType.Currency
    currency?: string
}
