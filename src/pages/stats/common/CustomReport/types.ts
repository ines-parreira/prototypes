import {FunctionComponent, ReactNode} from 'react'

import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'

import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'

type DataExportFetch =
    | MetricTrendFetch
    | TimeSeriesFetch
    | MetricPerDimensionFetch[]

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<
        T,
        {
            chartComponent: FunctionComponent
            label: ReactNode
            csvProducer: DataExportFetch | null
        }
    >
}
