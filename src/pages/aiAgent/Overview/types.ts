import {StatType} from 'models/stat/types'

export type KpiMetric = {
    isLoading: boolean
    title: string
    hint: string
    value?: number
    prevValue?: number
    metricType: StatType.Number | StatType.Percent | StatType.Currency
    currency?: string
}
