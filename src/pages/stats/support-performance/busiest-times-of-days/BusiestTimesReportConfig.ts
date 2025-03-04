import { FilterComponentKey, FilterKey } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { BusiestTimesOfDaysTableChart } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTableChart'
import { STATS_ROUTES } from 'routes/constants'
import { fetchAggregatedBusiestTimesOfDayReportData } from 'services/reporting/busiestTimesOfDaysReportingService'

export const BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const BUSIEST_TIME_OF_DAY_PAGE_TITLE = 'Busiest times'

export enum BusiestTimesChart {
    BusiestTimesTable = 'busiest-times-table',
}

export const BusiestTimesReportConfig: ReportConfig<BusiestTimesChart> = {
    id: ReportsIDs.BusiestTimesReportConfig,
    reportName: BUSIEST_TIME_OF_DAY_PAGE_TITLE,
    reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES,
    charts: {
        [BusiestTimesChart.BusiestTimesTable]: {
            chartComponent: BusiestTimesOfDaysTableChart,
            label: 'Busiest times',
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchAggregatedBusiestTimesOfDayReportData,
                },
            ],
            description:
                'Selected metric broken down per hour per day of the week',
            chartType: ChartType.Table,
        },
    },
    reportFilters: {
        persistent: [
            FilterKey.Period,
            FilterComponentKey.BusiestTimesMetricSelectFilter,
        ],
        optional: BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    },
}
