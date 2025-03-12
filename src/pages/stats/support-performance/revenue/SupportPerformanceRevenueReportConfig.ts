import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ReportConfig } from 'pages/stats/dashboards/types'

export const SUPPORT_PERFORMANCE_REVENUE_PAGE_TITLE = 'Revenue'

export const SupportPerformanceRevenueReportConfig: ReportConfig<string> = {
    id: ReportsIDs.SupportPerformanceRevenueReportConfig,
    reportName: SUPPORT_PERFORMANCE_REVENUE_PAGE_TITLE,
    reportPath: 'revenue',
    charts: {},
    reportFilters: {
        persistent: [],
        optional: [],
    },
}
