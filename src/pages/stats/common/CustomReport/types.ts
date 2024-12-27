import {FunctionComponent, ReactNode} from 'react'

import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'

type DataExportFetch =
    | MetricTrendFetch
    | TimeSeriesFetch
    | MetricPerDimensionFetch[]

export type ChartConfig = {
    chartComponent: FunctionComponent
    label: ReactNode
    csvProducer: DataExportFetch | null
    description: ReactNode
    icon: {name: string; tooltip: string}
}

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<T, ChartConfig>
}
