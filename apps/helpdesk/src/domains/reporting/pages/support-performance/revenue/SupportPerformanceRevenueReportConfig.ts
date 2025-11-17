import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'

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
