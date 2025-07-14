import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { BusiestTimesOfDaysTableChart } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysTableChart'
import { fetchAggregatedBusiestTimesOfDayReportData } from 'domains/reporting/services/busiestTimesOfDaysReportingService'
import { STATS_ROUTES } from 'routes/constants'

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
