import {ReportConfig} from 'pages/stats/custom-reports/types'

export const SUPPORT_PERFORMANCE_REVENUE_PAGE_TITLE = 'Revenue'

export const SupportPerformanceRevenueReportConfig: ReportConfig<string> = {
    reportName: SUPPORT_PERFORMANCE_REVENUE_PAGE_TITLE,
    reportPath: 'revenue',
    charts: {},
    reportFilters: {
        persistent: [],
        optional: [],
    },
}
