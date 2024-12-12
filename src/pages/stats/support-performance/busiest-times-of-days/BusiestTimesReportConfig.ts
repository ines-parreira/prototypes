import {ReportConfig} from 'pages/stats/common/CustomReport/types'
import {BusiestTimesOfDaysTableChart} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTableChart'

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
        },
    },
}
