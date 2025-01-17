import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'
import {BusiestTimesOfDaysTableChart} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTableChart'

export const BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export const BUSIEST_TIME_OF_DAY_PAGE_TITLE = 'Busiest times'

export enum BusiestTimesChart {
    BusiestTimesTable = 'busiest-times-table',
}

export const BusiestTimesReportConfig: ReportConfig<BusiestTimesChart> = {
    reportName: BUSIEST_TIME_OF_DAY_PAGE_TITLE,
    reportPath: 'busiest-times-of-days',
    charts: {
        [BusiestTimesChart.BusiestTimesTable]: {
            chartComponent: BusiestTimesOfDaysTableChart,
            label: 'Busiest times',
            csvProducer: null,
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
